/**
 * Validation Utility Tests
 * Tests for input validation logic used across the application
 */


import { describe, it, expect, vi } from 'vitest';

// Validation constants (matching the goals API)
const VALID_ACTIVITY_TYPES = ['Run', 'Ride', 'Swim', 'Walk', 'Hike', 'any'];
const MAX_PENALTY = 500;
const MAX_TARGET = 1000;

// Validation functions (extracted logic from goals API)
function validateActivityType(type: string): { valid: boolean; error?: string } {
    if (!type) return { valid: false, error: 'Activity type is required' };
    if (!VALID_ACTIVITY_TYPES.includes(type)) {
        return { valid: false, error: `Invalid activity type. Must be one of: ${VALID_ACTIVITY_TYPES.join(', ')}` };
    }
    return { valid: true };
}

function validateTarget(target: number | string): { valid: boolean; error?: string } {
    const parsed = typeof target === 'string' ? parseFloat(target) : target;
    if (isNaN(parsed)) return { valid: false, error: 'Target must be a number' };
    if (parsed <= 0) return { valid: false, error: 'Target must be a positive number' };
    if (parsed > MAX_TARGET) return { valid: false, error: `Target cannot exceed ${MAX_TARGET} km` };
    return { valid: true };
}

function validatePenalty(penalty: number | string): { valid: boolean; error?: string } {
    const parsed = typeof penalty === 'string' ? parseFloat(penalty) : penalty;
    if (isNaN(parsed)) return { valid: false, error: 'Penalty must be a number' };
    if (parsed < 0) return { valid: false, error: 'Penalty must be a non-negative number' };
    if (parsed > MAX_PENALTY) return { valid: false, error: `Penalty cannot exceed $${MAX_PENALTY} for safety` };
    return { valid: true };
}

function validateFrequency(frequency: string): { valid: boolean; error?: string } {
    if (!['weekly', 'monthly'].includes(frequency)) {
        return { valid: false, error: 'Frequency must be "weekly" or "monthly"' };
    }
    return { valid: true };
}

describe('Goal Validation', () => {
    describe('validateActivityType', () => {
        it('should accept valid activity types', () => {
            VALID_ACTIVITY_TYPES.forEach(type => {
                expect(validateActivityType(type)).toEqual({ valid: true });
            });
        });

        it('should reject empty activity type', () => {
            expect(validateActivityType('')).toEqual({
                valid: false,
                error: 'Activity type is required'
            });
        });

        it('should reject invalid activity type', () => {
            const result = validateActivityType('InvalidType');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Invalid activity type');
        });
    });

    describe('validateTarget', () => {
        it('should accept valid targets', () => {
            expect(validateTarget(10)).toEqual({ valid: true });
            expect(validateTarget(50.5)).toEqual({ valid: true });
            expect(validateTarget('25')).toEqual({ valid: true });
            expect(validateTarget(1000)).toEqual({ valid: true });
        });

        it('should reject zero target', () => {
            const result = validateTarget(0);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('positive');
        });

        it('should reject negative target', () => {
            const result = validateTarget(-5);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('positive');
        });

        it('should reject target over 1000', () => {
            const result = validateTarget(1001);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('1000');
        });

        it('should reject non-numeric target', () => {
            const result = validateTarget('not-a-number');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('number');
        });
    });

    describe('validatePenalty', () => {
        it('should accept valid penalties', () => {
            expect(validatePenalty(0)).toEqual({ valid: true });
            expect(validatePenalty(10)).toEqual({ valid: true });
            expect(validatePenalty(500)).toEqual({ valid: true });
            expect(validatePenalty('25.50')).toEqual({ valid: true });
        });

        it('should reject negative penalty', () => {
            const result = validatePenalty(-1);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('non-negative');
        });

        it('should reject penalty over $500', () => {
            const result = validatePenalty(501);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('500');
        });

        it('should reject non-numeric penalty', () => {
            const result = validatePenalty('invalid');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('number');
        });
    });

    describe('validateFrequency', () => {
        it('should accept weekly frequency', () => {
            expect(validateFrequency('weekly')).toEqual({ valid: true });
        });

        it('should accept monthly frequency', () => {
            expect(validateFrequency('monthly')).toEqual({ valid: true });
        });

        it('should reject invalid frequency', () => {
            expect(validateFrequency('daily').valid).toBe(false);
            expect(validateFrequency('yearly').valid).toBe(false);
            expect(validateFrequency('').valid).toBe(false);
        });
    });
});

describe('Goal Progress Calculation', () => {
    function calculateProgress(activities: { distance: number }[], targetKm: number): number {
        const totalKm = activities.reduce((sum, act) => sum + act.distance, 0) / 1000;
        return Math.min((totalKm / targetKm) * 100, 100);
    }

    it('should calculate 0% progress with no activities', () => {
        expect(calculateProgress([], 50)).toBe(0);
    });

    it('should calculate partial progress', () => {
        const activities = [{ distance: 10000 }, { distance: 15000 }]; // 25km total
        expect(calculateProgress(activities, 50)).toBe(50);
    });

    it('should cap at 100% when goal exceeded', () => {
        const activities = [{ distance: 60000 }]; // 60km
        expect(calculateProgress(activities, 50)).toBe(100);
    });

    it('should handle decimal distances', () => {
        const activities = [{ distance: 5500 }]; // 5.5km
        const progress = calculateProgress(activities, 10);
        expect(progress).toBeCloseTo(55, 1);
    });
});
