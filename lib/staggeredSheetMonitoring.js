import { checkAllSheetsForChanges, getAllConfiguredSpreadsheets, getAllSheetsInSpreadsheet } from './googleSheetsChangeDetector';

// Track which sheets we've checked in this cycle
let currentCycleIndex = 0;
let allSheetsList = [];
let cycleComplete = false;

/**
 * Get all sheets across all spreadsheets
 */
export const getAllSheetsList = async () => {
  if (allSheetsList.length > 0) {
    return allSheetsList;
  }

  console.log('📋 Building comprehensive sheets list...');
  const allSpreadsheets = await getAllConfiguredSpreadsheets();
  const sheetsList = [];

  for (const [spreadsheetId, spreadsheetInfo] of Object.entries(allSpreadsheets)) {
    try {
      const sheets = await getAllSheetsInSpreadsheet(spreadsheetId);
      sheets.forEach(sheet => {
        sheetsList.push({
          spreadsheetId,
          spreadsheetName: spreadsheetInfo.name,
          spreadsheetType: spreadsheetInfo.type,
          sheetName: sheet.title,
          sheetId: sheet.sheetId,
          rowCount: sheet.rowCount,
          columnCount: sheet.columnCount
        });
      });
    } catch (error) {
      console.error(`❌ Failed to get sheets for ${spreadsheetInfo.name}:`, error.message);
    }
  }

  allSheetsList = sheetsList;
  console.log(`📊 Built list of ${allSheetsList.length} sheets across ${Object.keys(allSpreadsheets).length} spreadsheets`);
  return allSheetsList;
};

/**
 * Check a subset of sheets to avoid quota limits
 */
export const checkSheetsSubset = async (batchSize = 5) => {
  try {
    const sheetsList = await getAllSheetsList();
    
    if (sheetsList.length === 0) {
      console.log('⚠️ No sheets to check');
      return { results: [], cycleComplete: true };
    }

    // Calculate which sheets to check in this batch
    const startIndex = currentCycleIndex;
    const endIndex = Math.min(startIndex + batchSize, sheetsList.length);
    const batchSheets = sheetsList.slice(startIndex, endIndex);

    console.log(`🔄 Checking batch ${Math.floor(startIndex / batchSize) + 1}: sheets ${startIndex + 1}-${endIndex} of ${sheetsList.length}`);

    const results = [];
    
    for (const sheetInfo of batchSheets) {
      try {
        console.log(`🔍 Checking: ${sheetInfo.spreadsheetName} - ${sheetInfo.sheetName}`);
        
        // Import the checkSheetForChanges function
        const { checkSheetForChanges } = await import('./googleSheetsChangeDetector');
        const result = await checkSheetForChanges(sheetInfo.spreadsheetId, sheetInfo.sheetName);
        
        results.push({
          ...sheetInfo,
          changes: result.changes,
          isFirstCheck: result.isFirstCheck
        });
        
        if (result.changes.length > 0) {
          console.log(`✅ Found ${result.changes.length} changes in ${sheetInfo.sheetName}`);
        }
        
        // Add delay between individual sheet checks
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ Failed to check ${sheetInfo.sheetName}:`, error.message);
        results.push({
          ...sheetInfo,
          error: error.message,
          changes: [],
          isFirstCheck: false
        });
        
        // Add delay even on error
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Update cycle progress
    currentCycleIndex = endIndex;
    
    // Check if cycle is complete
    if (currentCycleIndex >= sheetsList.length) {
      console.log('🎉 Cycle complete! All sheets have been checked.');
      cycleComplete = true;
      currentCycleIndex = 0; // Reset for next cycle
    }

    const totalChanges = results.reduce((sum, result) => sum + result.changes.length, 0);
    console.log(`✅ Batch complete. Found ${totalChanges} changes in ${results.length} sheets.`);

    return {
      results,
      cycleComplete,
      progress: {
        current: currentCycleIndex,
        total: sheetsList.length,
        percentage: Math.round((currentCycleIndex / sheetsList.length) * 100)
      }
    };

  } catch (error) {
    console.error('❌ Error in staggered monitoring:', error);
    return { results: [], cycleComplete: false, error: error.message };
  }
};

/**
 * Reset the monitoring cycle
 */
export const resetMonitoringCycle = () => {
  currentCycleIndex = 0;
  allSheetsList = [];
  cycleComplete = false;
  console.log('🔄 Monitoring cycle reset');
};

/**
 * Get monitoring status
 */
export const getMonitoringStatus = () => {
  return {
    currentIndex: currentCycleIndex,
    totalSheets: allSheetsList.length,
    cycleComplete,
    progress: allSheetsList.length > 0 ? Math.round((currentCycleIndex / allSheetsList.length) * 100) : 0
  };
};








