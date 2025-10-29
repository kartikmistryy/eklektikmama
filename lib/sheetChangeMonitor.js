import { checkAllSheetsForChanges } from './googleSheetsChangeDetector';
import { checkSheetsSubset, resetMonitoringCycle, getMonitoringStatus } from './staggeredSheetMonitoring';

let monitoringInterval = null;
let isMonitoring = false;

/**
 * Start automatic monitoring of Google Sheets changes
 */
export const startSheetMonitoring = (intervalMinutes = 5) => {
  if (isMonitoring) {
    console.log('⚠️ Sheet monitoring is already running');
    return;
  }

  console.log(`🚀 Starting automatic Google Sheets monitoring (every ${intervalMinutes} minutes)`);
  
  isMonitoring = true;
  const intervalMs = intervalMinutes * 60 * 1000;
  
  // Run immediately
  checkAllSheetsForChanges().catch(error => {
    console.error('Error in initial sheet check:', error);
  });
  
  // Then run at intervals using staggered approach
  monitoringInterval = setInterval(async () => {
    try {
      console.log(`⏰ Running scheduled sheet change detection (staggered)...`);
      const result = await checkSheetsSubset(3); // Check 3 sheets at a time
      
      if (result.cycleComplete) {
        console.log('🎉 Full cycle completed, resetting for next cycle');
        resetMonitoringCycle();
      }
    } catch (error) {
      console.error('Error in scheduled sheet check:', error);
    }
  }, intervalMs);
  
  console.log('✅ Automatic sheet monitoring started');
};

/**
 * Stop automatic monitoring
 */
export const stopSheetMonitoring = () => {
  if (!isMonitoring) {
    console.log('⚠️ Sheet monitoring is not running');
    return;
  }

  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
  
  isMonitoring = false;
  console.log('🛑 Automatic sheet monitoring stopped');
};

/**
 * Get monitoring status
 */
export const getSheetMonitoringStatus = () => {
  return {
    isMonitoring,
    hasInterval: monitoringInterval !== null,
    status: isMonitoring ? 'running' : 'stopped'
  };
};

/**
 * Manual trigger for change detection
 */
export const triggerChangeDetection = async () => {
  console.log('🔍 Manual change detection triggered');
  try {
    const results = await checkAllSheetsForChanges();
    return results;
  } catch (error) {
    console.error('Error in manual change detection:', error);
    throw error;
  }
};
