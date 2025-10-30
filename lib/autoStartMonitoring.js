import { startSheetMonitoring } from './sheetChangeMonitor';

/**
 * Auto-start monitoring when the application starts
 * This ensures monitoring is always running
 */
export const autoStartMonitoring = () => {
  // Wait a bit for the application to fully initialize
  setTimeout(() => {
    console.log('🚀 Auto-starting Google Sheets monitoring...');
    
    // Start monitoring with 5-minute intervals
    startSheetMonitoring(5);
    
    console.log('✅ Google Sheets monitoring auto-started successfully');
  }, 10000); // Wait 10 seconds after app start
};

/**
 * Check if monitoring should be auto-started
 * This can be called from your main application file
 */
export const initializeMonitoring = () => {
  try {
    autoStartMonitoring();
  } catch (error) {
    console.error('❌ Failed to auto-start monitoring:', error);
  }
};








