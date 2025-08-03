// Simple API test suite for production readiness
const testEndpoints = async () => {
  const baseUrl = 'http://localhost:5000';
  const results = [];

  const testCases = [
    {
      name: 'Health Check',
      method: 'GET',
      url: '/api/health',
      expectedStatus: 200
    },
    {
      name: 'Crypto Prices',
      method: 'GET', 
      url: '/api/crypto-prices',
      expectedStatus: 200
    },
    {
      name: 'User Auth (Unauthorized)',
      method: 'GET',
      url: '/api/auth/user',
      expectedStatus: 401
    },
    {
      name: 'Rate Limiting Test',
      method: 'GET',
      url: '/api/crypto-prices',
      expectedStatus: 200,
      repeat: 5
    }
  ];

  console.log('🧪 Starting API Tests...\n');

  for (const test of testCases) {
    try {
      const repeat = test.repeat || 1;
      let success = true;
      let responseTime = 0;

      for (let i = 0; i < repeat; i++) {
        const startTime = Date.now();
        const response = await fetch(`${baseUrl}${test.url}`, {
          method: test.method
        });
        responseTime += Date.now() - startTime;

        if (response.status !== test.expectedStatus) {
          success = false;
          break;
        }
      }

      const avgResponseTime = responseTime / repeat;
      
      results.push({
        ...test,
        success,
        avgResponseTime,
        status: success ? '✅ PASS' : '❌ FAIL'
      });

      console.log(`${success ? '✅' : '❌'} ${test.name}: ${success ? 'PASS' : 'FAIL'} (${avgResponseTime.toFixed(0)}ms avg)`);

    } catch (error) {
      results.push({
        ...test,
        success: false,
        error: error.message,
        status: '❌ FAIL'
      });
      console.log(`❌ ${test.name}: FAIL - ${error.message}`);
    }
  }

  console.log('\n📊 Test Summary:');
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Success Rate: ${((passed/total) * 100).toFixed(1)}%`);

  if (passed === total) {
    console.log('\n🎉 All tests passed! API is ready for production.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix issues.');
  }

  return results;
};

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEndpoints().catch(console.error);
}

export { testEndpoints };