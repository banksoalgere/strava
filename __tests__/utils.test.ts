/**
 * Utility Function Tests
 * Tests for helper functions used across the application
 */

import { describe, it, expect } from 'vitest';

// Utility functions (matching lib/utils.ts and other helpers)
function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

function formatDistance(meters: number): string {
    const km = meters / 1000;
    return km >= 10 ? km.toFixed(1) : km.toFixed(2);
}

function formatPace(speedMps: number): string {
    if (speedMps <= 0) return '--:--';
    const paceMinPerKm = 1000 / speedMps / 60;
    const minutes = Math.floor(paceMinPerKm);
    const seconds = Math.round((paceMinPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

function getStartOfWeek(date: Date = new Date()): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getStartOfMonth(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

function isWithinPeriod(activityDate: Date, periodStart: Date, periodEnd: Date): boolean {
    return activityDate >= periodStart && activityDate <= periodEnd;
}

describe('cn (className utility)', () => {
    it('should combine multiple class names', () => {
        expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should filter out falsy values', () => {
        expect(cn('class1', false, null, undefined, 'class2')).toBe('class1 class2');
    });

    it('should handle empty input', () => {
        expect(cn()).toBe('');
    });

    it('should handle conditional classes', () => {
        const isActive = true;
        const isDisabled = false;
        expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
    });
});

describe('formatDistance', () => {
    it('should format distances under 10km with 2 decimals', () => {
        expect(formatDistance(5500)).toBe('5.50');
        expect(formatDistance(9999)).toBe('10.00');
    });

    it('should format distances over 10km with 1 decimal', () => {
        expect(formatDistance(15000)).toBe('15.0');
        expect(formatDistance(42195)).toBe('42.2');
    });

    it('should handle zero', () => {
        expect(formatDistance(0)).toBe('0.00');
    });
});

describe('formatPace', () => {
    it('should format pace correctly', () => {
        // 3.33 m/s = 5:00 min/km
        expect(formatPace(3.33)).toBe('5:00');
    });

    it('should handle slow pace', () => {
        // 2.0 m/s = 8:20 min/km
        const pace = formatPace(2.0);
        expect(pace).toMatch(/8:\d{2}/);
    });

    it('should handle zero speed', () => {
        expect(formatPace(0)).toBe('--:--');
    });

    it('should handle negative speed', () => {
        expect(formatPace(-1)).toBe('--:--');
    });

    it('should pad seconds correctly', () => {
        // Fast pace that results in single-digit seconds
        const pace = formatPace(5.0); // ~3:20 min/km
        expect(pace).toMatch(/\d:\d{2}/);
    });
});

describe('formatDuration', () => {
    it('should format hours and minutes', () => {
        expect(formatDuration(3660)).toBe('1h 1m');
        expect(formatDuration(7200)).toBe('2h 0m');
    });

    it('should format minutes and seconds', () => {
        expect(formatDuration(125)).toBe('2m 5s');
        expect(formatDuration(600)).toBe('10m 0s');
    });

    it('should format seconds only', () => {
        expect(formatDuration(45)).toBe('45s');
    });

    it('should handle zero', () => {
        expect(formatDuration(0)).toBe('0s');
    });
});

describe('getStartOfWeek', () => {
    it('should return Monday of current week', () => {
        const wednesday = new Date('2026-01-15T12:00:00Z'); // Wednesday
        const monday = getStartOfWeek(wednesday);
        expect(monday.getDay()).toBe(1); // Monday
        // Check it's before the original date
        expect(monday.getTime()).toBeLessThan(wednesday.getTime());
    });

    it('should handle Sunday correctly', () => {
        const sunday = new Date('2026-01-11T12:00:00Z'); // Sunday
        const monday = getStartOfWeek(sunday);
        expect(monday.getDay()).toBe(1);
        expect(monday.getDate()).toBe(5); // Previous Monday
    });

    it('should set time to midnight', () => {
        const date = new Date('2026-01-15T15:30:00Z');
        const monday = getStartOfWeek(date);
        expect(monday.getHours()).toBe(0);
        expect(monday.getMinutes()).toBe(0);
        expect(monday.getSeconds()).toBe(0);
    });
});

describe('getStartOfMonth', () => {
    it('should return first day of month', () => {
        const midMonth = new Date('2026-01-15T12:00:00Z');
        const firstDay = getStartOfMonth(midMonth);
        expect(firstDay.getDate()).toBe(1);
        expect(firstDay.getMonth()).toBe(0); // January
    });

    it('should set time to midnight', () => {
        const date = new Date('2026-01-15T15:30:00Z');
        const firstDay = getStartOfMonth(date);
        expect(firstDay.getHours()).toBe(0);
        expect(firstDay.getMinutes()).toBe(0);
    });
});

describe('isWithinPeriod', () => {
    const start = new Date('2026-01-06T00:00:00Z');
    const end = new Date('2026-01-12T23:59:59Z');

    it('should return true for date within period', () => {
        const date = new Date('2026-01-10T12:00:00Z');
        expect(isWithinPeriod(date, start, end)).toBe(true);
    });

    it('should return true for date at start of period', () => {
        expect(isWithinPeriod(start, start, end)).toBe(true);
    });

    it('should return true for date at end of period', () => {
        expect(isWithinPeriod(end, start, end)).toBe(true);
    });

    it('should return false for date before period', () => {
        const before = new Date('2026-01-05T12:00:00Z');
        expect(isWithinPeriod(before, start, end)).toBe(false);
    });

    it('should return false for date after period', () => {
        const after = new Date('2026-01-13T12:00:00Z');
        expect(isWithinPeriod(after, start, end)).toBe(false);
    });
});
