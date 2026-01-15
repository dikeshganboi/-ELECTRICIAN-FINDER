#!/usr/bin/env node

/**
 * Deployment Health Check Script
 * Tests all deployed endpoints
 * 
 * Usage: node check-deployment.js
 */

const https = require('https');

// Configuration (Update with your URLs)
const CONFIG = {
  backend: process.env.BACKEND_URL || 'https://your-backend.onrender.com',
  userFrontend: process.env.USER_FRONTEND_URL || 'https://your-user-app.vercel.app',
  adminFrontend: process.env.ADMIN_FRONTEND_URL || 'https://your-admin-app.vercel.app'
};

console.log('\n🔍 Deployment Health Check\n');
console.log('Backend:', CONFIG.backend);
console.log('User Frontend:', CONFIG.userFrontend);
console.log('Admin Frontend:', CONFIG.adminFrontend);
console.log('\n' + '='.repeat(60) + '\n');

// Test endpoint
function testEndpoint(url, name) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    https.get(url, (res) => {
      const duration = Date.now() - startTime;
      const status = res.statusCode;
      
      if (status >= 200 && status < 400) {
        console.log(`✅ ${name}: OK (${status}) - ${duration}ms`);
        resolve({ success: true, status, duration });
      } else {
        console.log(`⚠️  ${name}: ${status} - ${duration}ms`);
        resolve({ success: false, status, duration });
      }
    }).on('error', (err) => {
      console.log(`❌ ${name}: FAILED - ${err.message}`);
      resolve({ success: false, error: err.message });
    });
  });
}

async function runHealthChecks() {
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Test 1: Backend Health
  console.log('Testing Backend...');
  const backendHealth = await testEndpoint(
    `${CONFIG.backend}/api/health`,
    'Backend Health Endpoint'
  );
  results.tests.push(backendHealth);
  if (backendHealth.success) results.passed++; else results.failed++;
  
  // Test 2: User Frontend
  console.log('\nTesting User Frontend...');
  const userFrontend = await testEndpoint(
    CONFIG.userFrontend,
    'User Frontend Homepage'
  );
  results.tests.push(userFrontend);
  if (userFrontend.success) results.passed++; else results.failed++;
  
  // Test 3: Admin Frontend
  console.log('\nTesting Admin Frontend...');
  const adminFrontend = await testEndpoint(
    CONFIG.adminFrontend,
    'Admin Frontend Homepage'
  );
  results.tests.push(adminFrontend);
  if (adminFrontend.success) results.passed++; else results.failed++;
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary\n');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All systems operational!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some services are down. Check the logs above.\n');
    process.exit(1);
  }
}

// Run checks
runHealthChecks().catch(err => {
  console.error('\n❌ Health check failed:', err.message);
  process.exit(1);
});
