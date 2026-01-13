/**
 * API Test Suite for Strava Accountability
 * 
 * This file contains test cases for validating our API implementations.
 * Run with: npx ts-node __tests__/api.test.ts (requires base URL as env var)
 * 
 * For actual testing, you would typically use Jest or Vitest.
 * This file serves as documentation and manual testing reference.
 */

// Test Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

interface TestResult {
    name: string;
    passed: boolean;
    message: string;
}

// Test helper functions
async function testEndpoint(
    name: string,
    method: string,
    path: string,
    body?: object,
    headers?: Record<string, string>,
    expectedStatus?: number
): Promise<TestResult> {
    try {
        const response = await fetch(`${BASE_URL}${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = await response.json().catch(() => ({}));
        const passed = expectedStatus ? response.status === expectedStatus : response.ok;

        return {
            name,
            passed,
            message: passed
                ? `✅ ${response.status} - ${JSON.stringify(data).slice(0, 100)}`
                : `❌ Expected ${expectedStatus}, got ${response.status} - ${JSON.stringify(data).slice(0, 100)}`,
        };
    } catch (error) {
        return {
            name,
            passed: false,
            message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

// Test Suites

/**
 * Authentication Tests
 * Tests that protected endpoints return 401 when not authenticated
 */
const authTests = [
    {
        name: 'GET /api/user/data should return 401 without auth',
        test: () => testEndpoint('Unauthorized user data', 'GET', '/api/user/data', undefined, {}, 401),
    },
    {
        name: 'GET /api/user/stats should return 401 without auth',
        test: () => testEndpoint('Unauthorized user stats', 'GET', '/api/user/stats', undefined, {}, 401),
    },
    {
        name: 'POST /api/stripe/setup-intent should return 401 without auth',
        test: () => testEndpoint('Unauthorized setup intent', 'POST', '/api/stripe/setup-intent', {}, {}, 401),
    },
    {
        name: 'POST /api/stripe/save-payment-method should return 401 without auth',
        test: () => testEndpoint('Unauthorized save payment', 'POST', '/api/stripe/save-payment-method', {}, {}, 401),
    },
    {
        name: 'POST /api/goals should return 401 without auth',
        test: () => testEndpoint('Unauthorized create goal', 'POST', '/api/goals', { type: 'Run', target: 10, penalty: 5 }, {}, 401),
    },
    {
        name: 'POST /api/user/sync should return 401 without auth',
        test: () => testEndpoint('Unauthorized sync', 'POST', '/api/user/sync', { userId: 'test' }, {}, 401),
    },
];

/**
 * Input Validation Tests for Goals API
 * Tests that the goals API properly validates input
 */
const validationTestCases = [
    {
        name: 'Goals API - Missing type should return 400',
        body: { target: 10, penalty: 5 },
        expectedStatus: 400,
    },
    {
        name: 'Goals API - Invalid type should return 400',
        body: { type: 'InvalidType', target: 10, penalty: 5 },
        expectedStatus: 400,
    },
    {
        name: 'Goals API - Negative target should return 400',
        body: { type: 'Run', target: -5, penalty: 5 },
        expectedStatus: 400,
    },
    {
        name: 'Goals API - Zero target should return 400',
        body: { type: 'Run', target: 0, penalty: 5 },
        expectedStatus: 400,
    },
    {
        name: 'Goals API - Target > 1000 should return 400',
        body: { type: 'Run', target: 1001, penalty: 5 },
        expectedStatus: 400,
    },
    {
        name: 'Goals API - Negative penalty should return 400',
        body: { type: 'Run', target: 10, penalty: -1 },
        expectedStatus: 400,
    },
    {
        name: 'Goals API - Penalty > 500 should return 400',
        body: { type: 'Run', target: 10, penalty: 501 },
        expectedStatus: 400,
    },
    {
        name: 'Goals API - Invalid frequency should return 400',
        body: { type: 'Run', target: 10, penalty: 5, frequency: 'daily' },
        expectedStatus: 400,
    },
];

/**
 * Stripe Webhook Tests
 * Tests that the webhook endpoint handles various scenarios
 */
const webhookTests = [
    {
        name: 'Webhook - Missing signature should return 400',
        test: () => testEndpoint('Webhook no signature', 'POST', '/api/stripe/webhook', { type: 'test' }, {}, 400),
    },
    {
        name: 'Webhook - Invalid signature should return 400',
        test: () => testEndpoint('Webhook invalid signature', 'POST', '/api/stripe/webhook', { type: 'test' }, { 'stripe-signature': 'invalid' }, 400),
    },
];

// Run all tests
async function runTests() {
    console.log('🧪 Running API Tests\n');
    console.log('='.repeat(60));

    const results: TestResult[] = [];

    // Auth tests
    console.log('\n📋 Authentication Tests\n');
    for (const { name, test } of authTests) {
        const result = await test();
        results.push(result);
        console.log(`${result.passed ? '✅' : '❌'} ${name}`);
        if (!result.passed) console.log(`   ${result.message}`);
    }

    // Validation tests (these will fail with 401 since we're not authenticated, which is expected)
    console.log('\n📋 Input Validation Tests (Note: Will get 401 first, actual validation requires auth)\n');
    for (const { name, body, expectedStatus } of validationTestCases) {
        // In a real test, we'd need to be authenticated
        console.log(`⚠️  ${name} - Requires authentication to fully test`);
    }

    // Webhook tests
    console.log('\n📋 Webhook Tests\n');
    for (const { name, test } of webhookTests) {
        const result = await test();
        results.push(result);
        console.log(`${result.passed ? '✅' : '❌'} ${name}`);
        if (!result.passed) console.log(`   ${result.message}`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${results.length} total`);

    return failed === 0;
}

// Export for use with test runners
export { runTests, authTests, validationTestCases, webhookTests };

// Run if executed directly
if (require.main === module) {
    runTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}
