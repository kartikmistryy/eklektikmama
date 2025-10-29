#!/usr/bin/env node

/**
 * Membership Google Sheets Log Monitor
 * 
 * This script helps you monitor membership changes in real-time
 * Run with: node monitor-membership-logs.js
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE = 'http://localhost:3000';
const POLL_INTERVAL = 5000; // 5 seconds

let lastActivity = null;
let isRunning = false;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  const timestamp = new Date().toLocaleString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function getRecentActivity() {
  try {
    const response = await makeRequest(`${API_BASE}/api/admin/google-sheets-logs?action=recent`);
    return response;
  } catch (error) {
    log(`Error fetching recent activity: ${error.message}`, 'red');
    return null;
  }
}

async function getMemberAudit(email) {
  try {
    const response = await makeRequest(`${API_BASE}/api/admin/google-sheets-logs?action=audit&email=${email}`);
    return response;
  } catch (error) {
    log(`Error fetching member audit: ${error.message}`, 'red');
    return null;
  }
}

function displayRecentActivity(data) {
  if (!data || !data.success) {
    log('Failed to fetch recent activity', 'red');
    return;
  }

  log(`📊 Recent Activity (${data.recentActivity.length} of ${data.totalMembers} members)`, 'cyan');
  console.log('');

  data.recentActivity.forEach((member, index) => {
    const statusColor = member.Status === 'active' ? 'green' : 
                       member.Status === 'cancelled' ? 'red' : 'yellow';
    
    log(`${index + 1}. ${member.Name} (${member.Email})`, 'white');
    log(`   Status: ${member.Status} | Plan: ${member['Plan Type']} | Row: ${member['Row ID']}`, statusColor);
    log(`   Last Updated: ${new Date(member['Last Updated']).toLocaleString()}`, 'blue');
    console.log('');
  });
}

function displayMemberAudit(data) {
  if (!data || !data.success) {
    log('Failed to fetch member audit', 'red');
    return;
  }

  const member = data.auditData;
  log(`🔍 Member Audit: ${member['First Name']} ${member['Last Name']}`, 'cyan');
  console.log('');

  Object.entries(member).forEach(([key, value]) => {
    const displayValue = value || '(empty)';
    log(`   ${key}: ${displayValue}`, 'white');
  });
  console.log('');
}

async function checkForChanges() {
  const currentActivity = await getRecentActivity();
  
  if (!currentActivity) {
    return;
  }

  if (lastActivity) {
    // Check if there are any new updates
    const currentLatest = currentActivity.recentActivity[0];
    const lastLatest = lastActivity.recentActivity[0];
    
    if (currentLatest && lastLatest && 
        currentLatest['Last Updated'] !== lastLatest['Last Updated']) {
      
      log('🔄 DETECTED CHANGES IN MEMBERSHIP SHEET!', 'yellow');
      console.log('');
      
      // Show the most recent change
      log(`📝 Latest Change:`, 'magenta');
      log(`   Member: ${currentLatest.Name} (${currentLatest.Email})`, 'white');
      log(`   Status: ${currentLatest.Status} | Plan: ${currentLatest['Plan Type']}`, 'green');
      log(`   Updated: ${new Date(currentLatest['Last Updated']).toLocaleString()}`, 'blue');
      console.log('');
      
      // Get detailed audit for the changed member
      log('🔍 Fetching detailed audit...', 'cyan');
      const audit = await getMemberAudit(currentLatest.Email);
      if (audit) {
        displayMemberAudit(audit);
      }
    }
  }
  
  lastActivity = currentActivity;
}

async function startMonitoring() {
  if (isRunning) {
    log('Monitor is already running!', 'yellow');
    return;
  }

  isRunning = true;
  log('🚀 Starting Membership Google Sheets Monitor', 'green');
  log(`📡 Polling every ${POLL_INTERVAL / 1000} seconds`, 'blue');
  log('Press Ctrl+C to stop', 'yellow');
  console.log('');

  // Initial fetch
  log('📊 Fetching initial data...', 'cyan');
  await checkForChanges();
  
  // Set up polling
  const interval = setInterval(async () => {
    await checkForChanges();
  }, POLL_INTERVAL);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n🛑 Stopping monitor...', 'yellow');
    clearInterval(interval);
    isRunning = false;
    log('✅ Monitor stopped', 'green');
    process.exit(0);
  });
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Start monitoring mode
    await startMonitoring();
  } else if (args[0] === 'recent') {
    // Show recent activity once
    log('📊 Fetching recent activity...', 'cyan');
    const data = await getRecentActivity();
    displayRecentActivity(data);
  } else if (args[0] === 'audit' && args[1]) {
    // Show member audit
    const email = args[1];
    log(`🔍 Fetching audit for: ${email}`, 'cyan');
    const data = await getMemberAudit(email);
    displayMemberAudit(data);
  } else {
    console.log('Usage:');
    console.log('  node monitor-membership-logs.js              # Start real-time monitoring');
    console.log('  node monitor-membership-logs.js recent       # Show recent activity once');
    console.log('  node monitor-membership-logs.js audit <email> # Show member audit');
    console.log('');
    console.log('Examples:');
    console.log('  node monitor-membership-logs.js');
    console.log('  node monitor-membership-logs.js recent');
    console.log('  node monitor-membership-logs.js audit user@example.com');
  }
}

// Run the script
main().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

