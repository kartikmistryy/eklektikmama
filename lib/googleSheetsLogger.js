import GoogleSheetsLog from '@/models/GoogleSheetsLog';
import { connectDB } from './db';

/**
 * Log Google Sheets operations for audit trail
 */
export const logGoogleSheetsOperation = async (logData) => {
  try {
    await connectDB();
    const log = new GoogleSheetsLog({
      operation: logData.operation,
      sheetName: logData.sheetName,
      spreadsheetId: logData.spreadsheetId,
      recordId: logData.recordId,
      recordEmail: logData.recordEmail,
      changes: logData.changes,
      oldValues: logData.oldValues,
      newValues: logData.newValues,
      source: logData.source,
      sourceDetails: logData.sourceDetails,
      success: logData.success !== false,
      errorMessage: logData.errorMessage,
      userAgent: logData.userAgent,
      ipAddress: logData.ipAddress
    });

    await log.save();
    console.log(`📝 Google Sheets operation logged: ${logData.operation} on ${logData.sheetName}`);
  } catch (error) {
    console.error('❌ Failed to log Google Sheets operation:', error);
    // Don't throw error - logging failure shouldn't break the main operation
  }
};

/**
 * Get Google Sheets logs with filtering options
 */
export const getGoogleSheetsLogs = async (filters = {}) => {
  try {
    await connectDB();
    const {
      sheetName,
      operation,
      recordEmail,
      startDate,
      endDate,
      limit = 100,
      skip = 0
    } = filters;

    const query = {};

    if (sheetName) {
      query.sheetName = sheetName;
    }

    if (operation) {
      query.operation = operation;
    }

    if (recordEmail) {
      query.recordEmail = recordEmail;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    const logs = await GoogleSheetsLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip);

    const total = await GoogleSheetsLog.countDocuments(query);

    return {
      logs,
      total,
      hasMore: skip + logs.length < total
    };
  } catch (error) {
    console.error('Error fetching Google Sheets logs:', error);
    throw error;
  }
};

/**
 * Get logs summary statistics
 */
export const getLogsSummary = async () => {
  try {
    await connectDB();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const [
      totalLogs,
      todayLogs,
      yesterdayLogs,
      lastWeekLogs,
      operationCounts,
      sheetCounts,
      recentLogs
    ] = await Promise.all([
      GoogleSheetsLog.countDocuments(),
      GoogleSheetsLog.countDocuments({ timestamp: { $gte: today } }),
      GoogleSheetsLog.countDocuments({ 
        timestamp: { $gte: yesterday, $lt: today } 
      }),
      GoogleSheetsLog.countDocuments({ timestamp: { $gte: lastWeek } }),
      GoogleSheetsLog.aggregate([
        { $group: { _id: '$operation', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      GoogleSheetsLog.aggregate([
        { $group: { _id: '$sheetName', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      GoogleSheetsLog.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .select('operation sheetName recordEmail timestamp success')
    ]);

    return {
      totalLogs,
      todayLogs,
      yesterdayLogs,
      lastWeekLogs,
      operationCounts,
      sheetCounts,
      recentLogs
    };
  } catch (error) {
    console.error('Error fetching logs summary:', error);
    throw error;
  }
};
