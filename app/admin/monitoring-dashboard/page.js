"use client";
import { useState, useEffect } from 'react';

export default function MonitoringDashboard() {
  const [monitoringStatus, setMonitoringStatus] = useState(null);
  const [logsSummary, setLogsSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    loadDashboardData();
    
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load monitoring status
      const statusResponse = await fetch('/api/admin/sheet-monitoring?action=status');
      const statusData = await statusResponse.json();
      
      if (statusData.success) {
        setMonitoringStatus(statusData.monitoring);
      }

      // Load logs summary
      const logsResponse = await fetch('/api/admin/google-sheets-logs-history?action=summary');
      const logsData = await logsResponse.json();
      
      if (logsData.success) {
        setLogsSummary(logsData.summary);
      }

      setLastUpdate(new Date().toLocaleString());
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data: ' + err.message);
    }
  };

  const triggerManualCheck = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/sheet-monitoring?action=trigger');
      const data = await response.json();

      if (data.success) {
        setError(null);
        // Reload data
        await loadDashboardData();
      } else {
        setError(data.error || 'Failed to trigger manual check');
      }
    } catch (err) {
      setError('Failed to trigger manual check: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100';
      case 'stopped': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return '🟢';
      case 'stopped': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              24/7 Google Sheets Monitoring Dashboard
            </h1>
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdate || 'Never'}
            </div>
          </div>
          
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${getStatusColor(monitoringStatus?.status)}`}>
                    {getStatusIcon(monitoringStatus?.status)}
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Monitoring Status</h3>
                  <p className="text-2xl font-bold text-gray-900 capitalize">
                    {monitoringStatus?.status || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-lg">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Operations</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {logsSummary?.totalLogs || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-lg">📅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Today&apos;s Activity</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {logsSummary?.todayLogs || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <span className="text-yellow-600 text-lg">📈</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">This Week</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {logsSummary?.lastWeekLogs || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Monitoring Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Current Status */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Current Monitoring Status</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(monitoringStatus?.status)}`}>
                    {monitoringStatus?.status || 'Unknown'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Monitoring:</span>
                  <span className="text-gray-900">
                    {monitoringStatus?.isMonitoring ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Interval Running:</span>
                  <span className="text-gray-900">
                    {monitoringStatus?.hasInterval ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={triggerManualCheck}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Checking...' : 'Check for Changes Now'}
                </button>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Activity Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Operations:</span>
                  <span className="text-gray-900 font-semibold">
                    {logsSummary?.totalLogs || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Today:</span>
                  <span className="text-gray-900 font-semibold">
                    {logsSummary?.todayLogs || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Yesterday:</span>
                  <span className="text-gray-900 font-semibold">
                    {logsSummary?.yesterdayLogs || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Week:</span>
                  <span className="text-gray-900 font-semibold">
                    {logsSummary?.lastWeekLogs || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 24/7 Monitoring Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-green-800 mb-4">🕐 24/7 Monitoring Active</h2>
            <div className="text-green-700 space-y-2">
              <p><strong>Continuous Monitoring:</strong> Your Google Sheets are being monitored 24/7 with 5-minute intervals.</p>
              <p><strong>Change Detection:</strong> All manual edits, cell changes, row additions/deletions are automatically detected and logged.</p>
              <p><strong>Historical Tracking:</strong> You can now check what changes happened 2 days ago, last week, or any time in the past.</p>
              <p><strong>Complete Audit Trail:</strong> Every change is logged with timestamps, before/after values, and detailed information.</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <a
              href="/admin/google-sheets-logs-history"
              className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition-colors"
            >
              <div className="text-lg font-semibold">View Activity Logs</div>
              <div className="text-sm opacity-90">See all changes with filters</div>
            </a>
            
            <a
              href="/admin/sheet-monitoring"
              className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition-colors"
            >
              <div className="text-lg font-semibold">Monitoring Controls</div>
              <div className="text-sm opacity-90">Start/stop monitoring</div>
            </a>
            
            <a
              href="/admin/google-sheets-logs"
              className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition-colors"
            >
              <div className="text-lg font-semibold">Current Data</div>
              <div className="text-sm opacity-90">View current sheet data</div>
            </a>
          </div>

          {/* Recent Activity */}
          {logsSummary?.recentLogs && logsSummary.recentLogs.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {logsSummary.recentLogs.slice(0, 5).map((log, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <span className="font-medium">{log.operation}</span> on <span className="font-medium">{log.sheetName}</span>
                      {log.recordEmail && <span className="text-gray-500"> - {log.recordEmail}</span>}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}














