#!/usr/bin/env node

/**
 * Ensure Google Sheets Monitoring is Always Running
 * 
 * This script checks if monitoring is running and starts it if needed
 * Run this periodically to ensure 24/7 monitoring
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

async function ensureMonitoringRunning() {
  console.log('🔍 Checking Google Sheets monitoring status...');
  
  try {
    // Check current status
    const status = await makeRequest(`${API_BASE}/api/admin/sheet-monitoring?action=status`);
    
    if (!status.success) {
      console.error('❌ Failed to check monitoring status:', status.error);
      return;
    }
    
    const monitoring = status.monitoring;
    console.log('📊 Current Status:', monitoring.status);
    
    if (monitoring.isMonitoring && monitoring.status === 'running') {
      console.log('✅ Monitoring is already running - no action needed');
      return;
    }
    
    console.log('🚀 Starting monitoring...');
    
    // Start monitoring
    const startResult = await makeRequest(`${API_BASE}/api/admin/sheet-monitoring`, 'POST', {
      action: 'start',
      interval: 5
    });
    
    if (startResult.success) {
      console.log('✅ Monitoring started successfully:', startResult.message);
    } else {
      console.error('❌ Failed to start monitoring:', startResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error ensuring monitoring is running:', error.message);
  }
}

// Run the check
ensureMonitoringRunning();




