import { google } from 'googleapis';
import { logGoogleSheetsOperation } from './googleSheetsLogger';
import SheetCache from '../models/SheetCache';
import { connectDB } from './db';

// In-memory cache for performance (backed by database)
const sheetDataCache = new Map();

/**
 * Initialize Google Sheets API with service account
 */
const getSheetsAPI = () => {
  const serviceAccountAuth = new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth: serviceAccountAuth });
};

/**
 * Get all data from a specific sheet
 */
export const getSheetData = async (spreadsheetId, sheetName) => {
  try {
    const sheets = getSheetsAPI();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: `${sheetName}!A:Z`, // Get all columns A to Z
    });

    return response.data.values || [];
  } catch (error) {
    console.error(`Error getting sheet data for ${sheetName}:`, error);
    throw error;
  }
};

/**
 * Load cache from database
 */
export const loadCacheFromDatabase = async (cacheKey) => {
  try {
    await connectDB();
    const cachedEntry = await SheetCache.findOne({ cacheKey });
    
    if (cachedEntry) {
      sheetDataCache.set(cacheKey, {
        data: cachedEntry.data,
        lastChecked: cachedEntry.lastChecked.toISOString(),
        rowCount: cachedEntry.rowCount,
        lastChangeCount: cachedEntry.lastChangeCount || 0
      });
      console.log(`📥 Loaded cache from database for ${cacheKey}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error loading cache from database for ${cacheKey}:`, error);
    return false;
  }
};

/**
 * Save cache to database
 */
export const saveCacheToDatabase = async (cacheKey, cacheData) => {
  try {
    await connectDB();
    
    const cacheEntry = {
      cacheKey,
      spreadsheetId: cacheData.spreadsheetId,
      sheetName: cacheData.sheetName,
      data: cacheData.data,
      lastChecked: new Date(cacheData.lastChecked),
      rowCount: cacheData.rowCount,
      lastChangeCount: cacheData.lastChangeCount || 0
    };
    
    await SheetCache.findOneAndUpdate(
      { cacheKey },
      cacheEntry,
      { upsert: true, new: true }
    );
    
    console.log(`💾 Saved cache to database for ${cacheKey}`);
    return true;
  } catch (error) {
    console.error(`❌ Error saving cache to database for ${cacheKey}:`, error);
    return false;
  }
};

/**
 * Get sheet metadata (headers, row count, etc.)
 */
export const getSheetMetadata = async (spreadsheetId, sheetName) => {
  try {
    const sheets = getSheetsAPI();
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
      includeGridData: false,
    });

    const sheet = response.data.sheets.find(s => s.properties.title === sheetName);
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }

    return {
      sheetId: sheet.properties.sheetId,
      title: sheet.properties.title,
      rowCount: sheet.properties.gridProperties.rowCount,
      columnCount: sheet.properties.gridProperties.columnCount,
      lastModified: new Date().toISOString() // We'll track this ourselves
    };
  } catch (error) {
    console.error(`Error getting sheet metadata for ${sheetName}:`, error);
    throw error;
  }
};

/**
 * Compare two sheet data arrays and detect changes
 */
export const detectChanges = (oldData, newData, sheetName) => {
  const changes = [];
  
  // Handle case where sheet is empty
  if (!oldData || oldData.length === 0) {
    if (newData && newData.length > 0) {
      changes.push({
        type: 'sheet_created',
        message: `Sheet "${sheetName}" was created with ${newData.length} rows`,
        details: { rowCount: newData.length }
      });
    }
    return changes;
  }

  if (!newData || newData.length === 0) {
    changes.push({
      type: 'sheet_cleared',
      message: `Sheet "${sheetName}" was cleared`,
      details: { previousRowCount: oldData.length }
    });
    return changes;
  }

  // Compare row by row
  const maxRows = Math.max(oldData.length, newData.length);
  
  for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
    const oldRow = oldData[rowIndex] || [];
    const newRow = newData[rowIndex] || [];
    const maxCols = Math.max(oldRow.length, newRow.length);
    
    // Check if entire row was added
    if (rowIndex >= oldData.length) {
      changes.push({
        type: 'row_added',
        rowIndex: rowIndex + 1, // 1-based for display
        message: `Row ${rowIndex + 1} was added`,
        details: {
          newRow: newRow,
          columnCount: newRow.length
        }
      });
      continue;
    }
    
    // Check if entire row was deleted
    if (rowIndex >= newData.length) {
      changes.push({
        type: 'row_deleted',
        rowIndex: rowIndex + 1,
        message: `Row ${rowIndex + 1} was deleted`,
        details: {
          oldRow: oldRow,
          columnCount: oldRow.length
        }
      });
      continue;
    }
    
    // Compare cell by cell
    const cellChanges = [];
    for (let colIndex = 0; colIndex < maxCols; colIndex++) {
      const oldValue = oldRow[colIndex] || '';
      const newValue = newRow[colIndex] || '';
      
      if (oldValue !== newValue) {
        cellChanges.push({
          column: String.fromCharCode(65 + colIndex), // A, B, C, etc.
          columnIndex: colIndex,
          oldValue: oldValue,
          newValue: newValue
        });
      }
    }
    
    if (cellChanges.length > 0) {
      changes.push({
        type: 'cells_updated',
        rowIndex: rowIndex + 1,
        message: `Row ${rowIndex + 1} was updated (${cellChanges.length} cells changed)`,
        details: {
          cellChanges: cellChanges,
          changeCount: cellChanges.length
        }
      });
    }
  }
  
  return changes;
};

/**
 * Check for changes in a specific sheet and log them
 */
export const checkSheetForChanges = async (spreadsheetId, sheetName) => {
  try {
    console.log(`🔍 Checking ${sheetName} for changes...`);
    
    // Get current sheet data
    const currentData = await getSheetData(spreadsheetId, sheetName);
    
    // Get cached data
    const cacheKey = `${spreadsheetId}_${sheetName}`;
    let cachedData = sheetDataCache.get(cacheKey);
    
    // If no cached data in memory, try to load from database
    if (!cachedData) {
      console.log(`📥 No cached data in memory, loading from database...`);
      const loaded = await loadCacheFromDatabase(cacheKey);
      if (loaded) {
        cachedData = sheetDataCache.get(cacheKey);
      }
    }
    
    // If still no cached data, this is the first check
    if (!cachedData) {
      console.log(`📝 First check for ${sheetName}, caching data...`);
      const cacheData = {
        data: currentData,
        lastChecked: new Date().toISOString(),
        rowCount: currentData.length,
        spreadsheetId,
        sheetName
      };
      sheetDataCache.set(cacheKey, cacheData);
      
      // Save to database
      await saveCacheToDatabase(cacheKey, cacheData);
      
      return { changes: [], isFirstCheck: true };
    }
    
    // Detect changes
    const changes = detectChanges(cachedData.data, currentData, sheetName);
    
    // Log each change
    for (const change of changes) {
      await logGoogleSheetsOperation({
        operation: getOperationType(change.type),
        sheetName: sheetName,
        spreadsheetId: spreadsheetId,
        changes: change.details,
        source: 'system',
        sourceDetails: `Automatic change detection - ${change.message}`,
        success: true
      });
      
      console.log(`📝 Logged change: ${change.message}`);
    }
    
    // Update cache
    const updatedCacheData = {
      data: currentData,
      lastChecked: new Date().toISOString(),
      rowCount: currentData.length,
      lastChangeCount: changes.length,
      spreadsheetId,
      sheetName
    };
    sheetDataCache.set(cacheKey, updatedCacheData);
    
    // Save updated cache to database
    await saveCacheToDatabase(cacheKey, updatedCacheData);
    
    return { changes, isFirstCheck: false };
    
  } catch (error) {
    console.error(`❌ Error checking ${sheetName} for changes:`, error);
    
    // Log the error
    await logGoogleSheetsOperation({
      operation: 'update', // Use a valid operation type for errors
      sheetName: sheetName,
      spreadsheetId: spreadsheetId,
      source: 'system',
      sourceDetails: `Error during change detection: ${error.message}`,
      success: false,
      errorMessage: error.message
    });
    
    throw error;
  }
};

/**
 * Map change type to operation type
 */
const getOperationType = (changeType) => {
  switch (changeType) {
    case 'row_added': return 'add';
    case 'row_deleted': return 'delete';
    case 'cells_updated': return 'update';
    case 'sheet_created': return 'create_sheet';
    case 'sheet_cleared': return 'delete';
    default: return 'update';
  }
};

/**
 * Get all configured spreadsheets and their sheets
 */
export const getAllConfiguredSpreadsheets = async () => {
  const { spreadsheetIds } = await import('./eventForms.js');
  
  // Get all configured spreadsheets
  const allSpreadsheets = {
    membership: {
      id: process.env.MEMBERSHIP_SPREADSHEET,
      name: 'Membership',
      type: 'membership'
    },
    ...Object.entries(spreadsheetIds).reduce((acc, [segment, spreadsheetId]) => {
      if (spreadsheetId) {
        acc[segment] = {
          id: spreadsheetId,
          name: segment,
          type: 'event'
        };
      }
      return acc;
    }, {})
  };
  
  // Remove duplicates and null values
  const uniqueSpreadsheets = {};
  Object.values(allSpreadsheets).forEach(spreadsheet => {
    if (spreadsheet.id && !uniqueSpreadsheets[spreadsheet.id]) {
      uniqueSpreadsheets[spreadsheet.id] = spreadsheet;
    }
  });
  
  return uniqueSpreadsheets;
};

/**
 * Get all sheets for a specific spreadsheet
 */
export const getAllSheetsInSpreadsheet = async (spreadsheetId) => {
  try {
    const sheets = getSheetsAPI();
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
      includeGridData: false,
    });
    
    return response.data.sheets.map(sheet => ({
      sheetId: sheet.properties.sheetId,
      title: sheet.properties.title,
      rowCount: sheet.properties.gridProperties.rowCount,
      columnCount: sheet.properties.gridProperties.columnCount,
      sheetType: sheet.properties.sheetType
    }));
  } catch (error) {
    console.error(`Error getting sheets for spreadsheet ${spreadsheetId}:`, error);
    throw error;
  }
};

/**
 * Add delay between API calls to respect rate limits
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check all configured sheets for changes across ALL spreadsheets with rate limiting
 */
export const checkAllSheetsForChanges = async () => {
  console.log('🔄 Starting comprehensive sheet change detection across ALL spreadsheets...');
  
  const results = [];
  const allSpreadsheets = await getAllConfiguredSpreadsheets();
  
  console.log(`📊 Found ${Object.keys(allSpreadsheets).length} spreadsheets to check`);
  
  for (const [spreadsheetId, spreadsheetInfo] of Object.entries(allSpreadsheets)) {
    try {
      console.log(`📋 Checking spreadsheet: ${spreadsheetInfo.name} (${spreadsheetId})`);
      
      // Get all sheets in this spreadsheet
      const sheets = await getAllSheetsInSpreadsheet(spreadsheetId);
      console.log(`📄 Found ${sheets.length} sheets in ${spreadsheetInfo.name}`);
      
      // Add delay between spreadsheet checks
      await delay(1000); // 1 second delay between spreadsheets
      
      // Check each sheet for changes with rate limiting
      for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i];
        try {
          console.log(`🔍 Checking sheet: ${sheet.title} (${i + 1}/${sheets.length})`);
          const result = await checkSheetForChanges(spreadsheetId, sheet.title);
          
          results.push({
            spreadsheetId,
            spreadsheetName: spreadsheetInfo.name,
            spreadsheetType: spreadsheetInfo.type,
            sheetName: sheet.title,
            sheetId: sheet.sheetId,
            rowCount: sheet.rowCount,
            columnCount: sheet.columnCount,
            changes: result.changes,
            isFirstCheck: result.isFirstCheck
          });
          
          if (result.changes.length > 0) {
            console.log(`✅ Found ${result.changes.length} changes in ${sheet.title}`);
          }
          
          // Add delay between sheet checks to respect rate limits
          if (i < sheets.length - 1) {
            await delay(500); // 500ms delay between sheets
          }
          
        } catch (error) {
          console.error(`❌ Failed to check sheet ${sheet.title}:`, error);
          results.push({
            spreadsheetId,
            spreadsheetName: spreadsheetInfo.name,
            spreadsheetType: spreadsheetInfo.type,
            sheetName: sheet.title,
            sheetId: sheet.sheetId,
            error: error.message,
            changes: [],
            isFirstCheck: false
          });
          
          // Add delay even on error to respect rate limits
          if (i < sheets.length - 1) {
            await delay(500);
          }
        }
      }
      
    } catch (error) {
      console.error(`❌ Failed to check spreadsheet ${spreadsheetInfo.name}:`, error);
      results.push({
        spreadsheetId,
        spreadsheetName: spreadsheetInfo.name,
        spreadsheetType: spreadsheetInfo.type,
        error: error.message,
        changes: [],
        isFirstCheck: false
      });
    }
  }
  
  const totalChanges = results.reduce((sum, result) => sum + result.changes.length, 0);
  const totalSheets = results.length;
  const spreadsheetsWithChanges = [...new Set(results.filter(r => r.changes.length > 0).map(r => r.spreadsheetName))];
  
  console.log(`✅ Change detection complete. Found ${totalChanges} total changes across ${totalSheets} sheets in ${Object.keys(allSpreadsheets).length} spreadsheets.`);
  console.log(`📊 Spreadsheets with changes: ${spreadsheetsWithChanges.join(', ') || 'None'}`);
  
  return results;
};

/**
 * Get cache status for debugging
 */
export const getCacheStatus = () => {
  const status = {};
  for (const [key, value] of sheetDataCache.entries()) {
    status[key] = {
      lastChecked: value.lastChecked,
      rowCount: value.rowCount,
      lastChangeCount: value.lastChangeCount || 0
    };
  }
  return status;
};
