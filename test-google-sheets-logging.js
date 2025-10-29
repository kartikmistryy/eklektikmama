#!/usr/bin/env node

/**
 * Test script to generate Google Sheets logs
 * This will help you see the logging system in action
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

async function testLoggingSystem() {
  console.log('🧪 Testing Google Sheets Logging System...\n');
  
  try {
    // Test 1: Check current logs summary
    console.log('1️⃣ Checking current logs summary...');
    const summary = await makeRequest(`${API_BASE}/api/admin/google-sheets-logs-history?action=summary`);
    console.log('📊 Current Summary:', JSON.stringify(summary.summary, null, 2));
    console.log('');
    
    // Test 2: Check recent activity from the old API
    console.log('2️⃣ Checking recent activity from old API...');
    const recentActivity = await makeRequest(`${API_BASE}/api/admin/google-sheets-logs?action=recent`);
    if (recentActivity.success && recentActivity.recentActivity.length > 0) {
      console.log('📋 Recent Activity:');
      recentActivity.recentActivity.slice(0, 3).forEach((member, index) => {
        console.log(`   ${index + 1}. ${member.Name} (${member.Email}) - ${member.Status}`);
      });
    } else {
      console.log('   No recent activity found');
    }
    console.log('');
    
    // Test 3: Check logs list
    console.log('3️⃣ Checking logs list...');
    const logsList = await makeRequest(`${API_BASE}/api/admin/google-sheets-logs-history?action=list&limit=5`);
    console.log(`📝 Found ${logsList.total} total logs`);
    if (logsList.logs.length > 0) {
      console.log('   Recent logs:');
      logsList.logs.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.operation} on ${log.sheetName} - ${new Date(log.timestamp).toLocaleString()}`);
      });
    } else {
      console.log('   No logs found yet');
    }
    console.log('');
    
    // Test 4: Test with filters
    console.log('4️⃣ Testing with filters...');
    const filteredLogs = await makeRequest(`${API_BASE}/api/admin/google-sheets-logs-history?action=list&sheetName=Members&operation=update&limit=3`);
    console.log(`🔍 Filtered logs (Members sheet, update operations): ${filteredLogs.total} found`);
    console.log('');
    
    console.log('✅ Testing completed successfully!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('   1. Visit: http://localhost:3000/admin/google-sheets-logs-history');
    console.log('   2. Make some changes to trigger logging (add/update members)');
    console.log('   3. Check the logs page to see the activity');
    console.log('   4. Use filters to find specific operations');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testLoggingSystem();

