import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { spreadsheetIds } from './lib/eventForms.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function analyzeMamaBreakfastData() {
  try {
    console.log('🔍 Analyzing Mama Breakfast Google Sheet Data...\n');

    // Initialize Google Sheets connection
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Get the mama breakfast spreadsheet
    const mamaBreakfastSpreadsheetId = spreadsheetIds.mamaBreakfast;
    
    if (!mamaBreakfastSpreadsheetId) {
      console.error('❌ No mama breakfast spreadsheet ID found');
      return;
    }

    console.log('📊 Mama Breakfast Spreadsheet ID:', mamaBreakfastSpreadsheetId);

    const doc = new GoogleSpreadsheet(mamaBreakfastSpreadsheetId, serviceAccountAuth);
    await doc.loadInfo();

    console.log('📋 Available sheets:');
    doc.sheetsByIndex.forEach((sheet, index) => {
      console.log(`  ${index + 1}. ${sheet.title} (${sheet.rowCount} rows)`);
    });

    // Find mama breakfast sheets (they typically have dates in the name)
    const mamaBreakfastSheets = doc.sheetsByIndex.filter(sheet => 
      sheet.title.includes('mama') || 
      sheet.title.includes('breakfast') ||
      sheet.title.includes('2024') ||
      sheet.title.includes('2025')
    );

    console.log(`\n🍽️ Found ${mamaBreakfastSheets.length} potential mama breakfast sheets:`);
    mamaBreakfastSheets.forEach((sheet, index) => {
      console.log(`  ${index + 1}. ${sheet.title} (${sheet.rowCount} rows)`);
    });

    // Analyze each mama breakfast sheet
    for (const sheet of mamaBreakfastSheets) {
      console.log(`\n📊 Analyzing sheet: ${sheet.title}`);
      console.log('=' .repeat(50));

      try {
        // Load the sheet data
        await sheet.loadHeaderRow();
        const rows = await sheet.getRows();

        if (rows.length === 0) {
          console.log('❌ No data rows found in this sheet');
          continue;
        }

        console.log(`📈 Total rows: ${rows.length}`);
        console.log(`📋 Headers: ${sheet.headerValues.join(', ')}`);

        // Analyze each column
        const columnAnalysis = {};
        
        sheet.headerValues.forEach(header => {
          columnAnalysis[header] = {
            totalRows: rows.length,
            emptyRows: 0,
            nonEmptyRows: 0,
            sampleValues: [],
            dataTypes: new Set()
          };
        });

        // Process each row
        rows.forEach((row, rowIndex) => {
          sheet.headerValues.forEach(header => {
            const value = row.get(header);
            const analysis = columnAnalysis[header];
            
            if (!value || value === '' || value === null || value === undefined) {
              analysis.emptyRows++;
            } else {
              analysis.nonEmptyRows++;
              if (analysis.sampleValues.length < 5) {
                analysis.sampleValues.push(value);
              }
              
              // Determine data type
              if (typeof value === 'string') {
                if (value.includes(',')) {
                  analysis.dataTypes.add('array-like');
                } else if (value.match(/^\d+$/)) {
                  analysis.dataTypes.add('number');
                } else if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
                  analysis.dataTypes.add('date');
                } else {
                  analysis.dataTypes.add('text');
                }
              } else {
                analysis.dataTypes.add(typeof value);
              }
            }
          });
        });

        // Display analysis results
        console.log('\n📊 Column Analysis:');
        console.log('-'.repeat(80));
        
        Object.entries(columnAnalysis).forEach(([header, analysis]) => {
          const emptyPercentage = ((analysis.emptyRows / analysis.totalRows) * 100).toFixed(1);
          const status = emptyPercentage > 50 ? '❌' : emptyPercentage > 20 ? '⚠️' : '✅';
          
          console.log(`${status} ${header}:`);
          console.log(`   Empty: ${analysis.emptyRows}/${analysis.totalRows} (${emptyPercentage}%)`);
          console.log(`   Non-empty: ${analysis.nonEmptyRows}/${analysis.totalRows}`);
          console.log(`   Sample values: [${analysis.sampleValues.join(', ')}]`);
          console.log(`   Data types: ${Array.from(analysis.dataTypes).join(', ')}`);
          console.log('');
        });

        // Identify problematic columns
        console.log('🚨 Problematic Columns:');
        const problematicColumns = Object.entries(columnAnalysis)
          .filter(([header, analysis]) => {
            const emptyPercentage = (analysis.emptyRows / analysis.totalRows) * 100;
            return emptyPercentage > 50;
          })
          .map(([header, analysis]) => ({
            header,
            emptyPercentage: ((analysis.emptyRows / analysis.totalRows) * 100).toFixed(1)
          }));

        if (problematicColumns.length > 0) {
          problematicColumns.forEach(col => {
            console.log(`   ❌ ${col.header}: ${col.emptyPercentage}% empty`);
          });
        } else {
          console.log('   ✅ No highly problematic columns found');
        }

        // Show sample data for debugging
        console.log('\n📝 Sample Data (first 3 rows):');
        console.log('-'.repeat(80));
        rows.slice(0, 3).forEach((row, index) => {
          console.log(`Row ${index + 1}:`);
          sheet.headerValues.forEach(header => {
            const value = row.get(header);
            console.log(`  ${header}: "${value}"`);
          });
          console.log('');
        });

      } catch (sheetError) {
        console.error(`❌ Error analyzing sheet ${sheet.title}:`, sheetError.message);
      }
    }

  } catch (error) {
    console.error('❌ Error analyzing mama breakfast data:', error);
  }
}

// Run the analysis
analyzeMamaBreakfastData();
