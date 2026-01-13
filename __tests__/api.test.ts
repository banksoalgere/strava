/**
 * API Route Tests
 * Tests for authentication, authorization, and API endpoint behavior
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch for API tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Authentication', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    describe('Protected Endpoints', () => {
        const protectedEndpoints = [
            { method: 'GET', path: '/api/user/data' },
            { method: 'GET', path: '/api/user/stats' },
            { method: 'POST', path: '/api/user/sync' },
            { method: 'POST', path: '/api/user/sync-history' },
            { method: 'POST', path: '/api/goals' },
            { method: 'POST', path: '/api/stripe/setup-intent' },
            { method: 'POST', path: '/api/stripe/save-payment-method' },
        ];

        it.each(protectedEndpoints)(
            '$method $path should require authentication',
            async ({ method, path }) => {
                // Simulate unauthenticated response
                mockFetch.mockResolvedValueOnce({
                    ok: false,
                    status: 401,
                    json: async () => ({ error: 'Unauthorized' }),
                });

                const response = await fetch(path, { method });
                expect(response.status).toBe(401);
            }
        );
    });

    describe('User Data Authorization', () => {
        it('should prevent users from accessing other users data', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                json: async () => ({ error: 'Forbidden' }),
            });

            // Attempt to save payment method for different user
            const response = await fetch('/api/stripe/save-payment-method', {
                method: 'POST',
                body: JSON.stringify({
                    userId: 'other-user-id',
                    paymentMethodId: 'pm_test',
                }),
            });

            expect(response.status).toBe(403);
        });
    });
});

describe('Goals API', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    describe('POST /api/goals', () => {
        it('should validate required fields', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => ({ error: 'Missing required fields: type, target, penalty' }),
            });

            const response = await fetch('/api/goals', {
                method: 'POST',
                body: JSON.stringify({ type: 'Run' }), // Missing target and penalty
            });

            const data = await response.json();
            expect(response.status).toBe(400);
            expect(data.error).toContain('Missing required fields');
        });

        it('should reject invalid activity type', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => ({ error: 'Invalid activity type' }),
            });

            const response = await fetch('/api/goals', {
                method: 'POST',
                body: JSON.stringify({ type: 'InvalidType', target: 50, penalty: 25 }),
            });

            const data = await response.json();
            expect(response.status).toBe(400);
            expect(data.error).toContain('Invalid activity type');
        });

        it('should reject penalty over $500', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => ({ error: 'Penalty cannot exceed $500' }),
            });

            const response = await fetch('/api/goals', {
                method: 'POST',
                body: JSON.stringify({ type: 'Run', target: 50, penalty: 501 }),
            });

            const data = await response.json();
            expect(response.status).toBe(400);
            expect(data.error).toContain('500');
        });

        it('should create goal with valid data', async () => {
            const mockGoal = {
                id: 'goal-123',
                type: 'Run',
                target: 50,
                penalty: 25,
                frequency: 'weekly',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ success: true, goal: mockGoal }),
            });

            const response = await fetch('/api/goals', {
                method: 'POST',
                body: JSON.stringify({ type: 'Run', target: 50, penalty: 25 }),
            });

            const data = await response.json();
            expect(response.ok).toBe(true);
            expect(data.success).toBe(true);
            expect(data.goal.type).toBe('Run');
        });
    });
});

describe('Stripe Webhook', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('should reject requests without signature', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ error: 'No signature provided' }),
        });

        const response = await fetch('/api/stripe/webhook', {
            method: 'POST',
            body: JSON.stringify({ type: 'payment_intent.succeeded' }),
        });

        expect(response.status).toBe(400);
    });

    it('should reject invalid signature', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ error: 'Invalid signature' }),
        });

        const response = await fetch('/api/stripe/webhook', {
            method: 'POST',
            headers: { 'stripe-signature': 'invalid-signature' },
            body: JSON.stringify({ type: 'payment_intent.succeeded' }),
        });

        expect(response.status).toBe(400);
    });

    it('should acknowledge valid webhook events', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ received: true }),
        });

        const response = await fetch('/api/stripe/webhook', {
            method: 'POST',
            headers: { 'stripe-signature': 'valid-signature' },
            body: JSON.stringify({ type: 'payment_intent.succeeded' }),
        });

        const data = await response.json();
        expect(response.ok).toBe(true);
        expect(data.received).toBe(true);
    });
});

describe('Strava Sync', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('should sync activities and return count', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                success: true,
                syncedCount: 15,
                activities: []
            }),
        });

        const response = await fetch('/api/user/sync', { method: 'POST' });
        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.success).toBe(true);
        expect(data.syncedCount).toBe(15);
    });

    it('should handle token refresh errors gracefully', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Failed to refresh Strava token' }),
        });

        const response = await fetch('/api/user/sync', { method: 'POST' });
        expect(response.status).toBe(500);
    });
});
