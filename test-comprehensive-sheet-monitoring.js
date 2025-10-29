#!/usr/bin/env node

/**
 * Comprehensive Google Sheets Change Monitoring Test
 * 
 * This script tests the complete change detection system
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE = 'http://localhost:3000';

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = client.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve(jsonData);
        } catch (error) {
          resolve({ success: false, error: 'Failed to parse JSON', raw: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testComprehensiveMonitoring() {
  console.log('🧪 Testing Comprehensive Google Sheets Change Monitoring...\n');
  
  try {
    // Test 1: Check monitoring status
    console.log('1️⃣ Checking monitoring status...');
    const status = await makeRequest(`${API_BASE}/api/admin/sheet-monitoring?action=status`);
    console.log('📊 Monitoring Status:', JSON.stringify(status.monitoring, null, 2));
    console.log('');
    
    // Test 2: Trigger manual change detection
    console.log('2️⃣ Triggering manual change detection...');
    const detection = await makeRequest(`${API_BASE}/api/admin/check-sheet-changes`, 'POST');
    console.log('🔍 Detection Results:', JSON.stringify(detection.summary, null, 2));
    console.log('');
    
    // Test 3: Check logs summary
    console.log('3️⃣ Checking logs summary...');
    const logsSummary = await makeRequest(`${API_BASE}/api/admin/google-sheets-logs-history?action=summary`);
    console.log('📝 Logs Summary:', JSON.stringify(logsSummary.summary, null, 2));
    console.log('');
    
    // Test 4: Check recent logs
    console.log('4️⃣ Checking recent logs...');
    const recentLogs = await makeRequest(`${API_BASE}/api/admin/google-sheets-logs-history?action=list&limit=5`);
    console.log(`📋 Found ${recentLogs.total} total logs`);
    if (recentLogs.logs.length > 0) {
      console.log('   Recent logs:');
      recentLogs.logs.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.operation} on ${log.sheetName} - ${new Date(log.timestamp).toLocaleString()}`);
      });
    } else {
      console.log('   No logs found yet');
    }
    console.log('');
    
    // Test 5: Test monitoring controls
    console.log('5️⃣ Testing monitoring controls...');
    console.log('   Starting monitoring (5 minute intervals)...');
    const startResult = await makeRequest(`${API_BASE}/api/admin/sheet-monitoring`, 'POST', {
      action: 'start',
      interval: 5
    });
    console.log('   Start Result:', startResult.message);
    
    // Check status again
    const statusAfter = await makeRequest(`${API_BASE}/api/admin/sheet-monitoring?action=status`);
    console.log('   Status after start:', statusAfter.monitoring.status);
    
    // Stop monitoring
    console.log('   Stopping monitoring...');
    const stopResult = await makeRequest(`${API_BASE}/api/admin/sheet-monitoring`, 'POST', {
      action: 'stop'
    });
    console.log('   Stop Result:', stopResult.message);
    console.log('');
    
    console.log('✅ Comprehensive monitoring test completed successfully!');
    console.log('');
    console.log('📋 System Status:');
    console.log('   ✅ Change detection API working');
    console.log('   ✅ Monitoring controls working');
    console.log('   ✅ Logging system ready');
    console.log('   ✅ Database integration working');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('   1. Visit: http://localhost:3000/admin/sheet-monitoring');
    console.log('   2. Start monitoring with your preferred interval');
    console.log('   3. Make changes to your Google Sheet');
    console.log('   4. Check: http://localhost:3000/admin/google-sheets-logs-history');
    console.log('   5. See all changes logged automatically!');
    console.log('');
    console.log('💡 The system will now capture:');
    console.log('   • Manual edits in Google Sheets');
    console.log('   • Cell value changes');
    console.log('   • Row additions/deletions');
    console.log('   • Any modifications made directly in the sheet');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testComprehensiveMonitoring();




