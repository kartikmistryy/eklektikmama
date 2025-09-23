#!/usr/bin/env node

/**
 * Comprehensive Membership Test Runner
 * Runs all membership-related tests and provides detailed diagnostics
 */

const { runAllTests } = require('./test-membership-flow');
const { runWebhookTests } = require('./test-membership-webhook');
const { runSheetsTests } = require('./test-membership-sheets');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runComprehensiveTests() {
  log('🚀 Starting Comprehensive Membership System Tests', 'bright');
  log('================================================', 'bright');
  
  const startTime = Date.now();
  
  try {
    // Run all test suites
    log('\n📋 Running Core Membership Flow Tests...', 'cyan');
    const flowResults = await runAllTests();
    
    log('\n📋 Running Webhook Tests...', 'cyan');
    const webhookResults = await runWebhookTests();
    
    log('\n📋 Running Google Sheets Tests...', 'cyan');
    const sheetsResults = await runSheetsTests();
    
    // Calculate overall results
    const allFlowPassed = Object.values(flowResults).every(Boolean);
    const allWebhookPassed = Object.values(webhookResults).every(Boolean);
    const allSheetsPassed = Object.values(sheetsResults).every(Boolean);
    
    const totalTests = Object.keys(flowResults).length + Object.keys(webhookResults).length + Object.keys(sheetsResults).length;
    const passedTests = Object.values(flowResults).filter(Boolean).length + 
                       Object.values(webhookResults).filter(Boolean).length + 
                       Object.values(sheetsResults).filter(Boolean).length;
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Final summary
    log('\n🎯 FINAL TEST SUMMARY', 'bright');
    log('====================', 'bright');
    log(`Total Tests: ${totalTests}`, 'blue');
    log(`Passed: ${passedTests}`, 'green');
    log(`Failed: ${totalTests - passedTests}`, 'red');
    log(`Duration: ${duration}s`, 'blue');
    
    log('\n📊 Test Suite Results:', 'bright');
    log(`Core Flow Tests: ${allFlowPassed ? '✅ ALL PASS' : '❌ SOME FAIL'}`, allFlowPassed ? 'green' : 'red');
    log(`Webhook Tests: ${allWebhookPassed ? '✅ ALL PASS' : '❌ SOME FAIL'}`, allWebhookPassed ? 'green' : 'red');
    log(`Google Sheets Tests: ${allSheetsPassed ? '✅ ALL PASS' : '❌ SOME FAIL'}`, allSheetsPassed ? 'green' : 'red');
    
    if (allFlowPassed && allWebhookPassed && allSheetsPassed) {
      log('\n🎉 ALL TESTS PASSED! Membership system is fully functional.', 'green');
      log('\n✅ Your membership system should work correctly for:', 'green');
      log('   • User signup and payment processing', 'green');
      log('   • Stripe webhook handling', 'green');
      log('   • Google Sheets data storage', 'green');
      log('   • Email notifications', 'green');
      log('   • Membership verification', 'green');
    } else {
      log('\n⚠️  SOME TESTS FAILED! Check the detailed output above.', 'yellow');
      
      log('\n🔧 Quick Fix Guide:', 'cyan');
      
      if (!allFlowPassed) {
        log('\n❌ Core Flow Issues:', 'red');
        log('   • Check environment variables (STRIPE_SECRET_KEY, MONGODB_URI)', 'yellow');
        log('   • Verify database connection', 'yellow');
        log('   • Test API endpoints manually', 'yellow');
      }
      
      if (!allWebhookPassed) {
        log('\n❌ Webhook Issues:', 'red');
        log('   • Check STRIPE_MEMBERSHIP_WEBHOOK_SECRET is set', 'yellow');
        log('   • Verify webhook endpoint URL in Stripe dashboard', 'yellow');
        log('   • Ensure webhook is pointing to /api/webhooks/membership', 'yellow');
      }
      
      if (!allSheetsPassed) {
        log('\n❌ Google Sheets Issues:', 'red');
        log('   • Check GOOGLE_SHEETS_CLIENT_EMAIL and GOOGLE_SHEETS_PRIVATE_KEY', 'yellow');
        log('   • Verify MEMBERSHIP_SPREADSHEET ID is correct', 'yellow');
        log('   • Ensure service account has edit permissions', 'yellow');
      }
      
      log('\n📞 Need Help?', 'cyan');
      log('   • Check the console output above for specific error messages', 'yellow');
      log('   • Verify all environment variables are set correctly', 'yellow');
      log('   • Test individual components using the specific test scripts', 'yellow');
    }
    
    return {
      success: allFlowPassed && allWebhookPassed && allSheetsPassed,
      flowResults,
      webhookResults,
      sheetsResults,
      totalTests,
      passedTests,
      duration
    };
    
  } catch (error) {
    log(`\n💥 Test runner error: ${error.message}`, 'red');
    console.error(error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runComprehensiveTests().catch(console.error);
}

module.exports = { runComprehensiveTests };
