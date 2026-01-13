/**
 * Type Safety Tests
 * Ensures our TypeScript types are correctly defined and used
 */

import { describe, it, expect } from 'vitest';
import type {
    Goal,
    Activity,
    User,
    DashboardStatProps,
    LifetimeStats,
    WeeklyData,
    ConsistencyData,
    StreakData
} from '@/types';

describe('Type Definitions', () => {
    describe('Goal type', () => {
        it('should have correct structure', () => {
            const goal: Goal = {
                id: 'goal-123',
                type: 'Run',
                target: 50,
                penalty: 25,
                progress: 30,
                status: 'active',
            };

            expect(goal.id).toBe('goal-123');
            expect(goal.type).toBe('Run');
            expect(goal.target).toBe(50);
            expect(goal.penalty).toBe(25);
            expect(goal.progress).toBe(30);
            expect(goal.status).toBe('active');
        });

        it('should allow inactive status', () => {
            const goal: Goal = {
                id: 'goal-456',
                type: 'Ride',
                target: 100,
                penalty: 0,
                progress: 100,
                status: 'inactive',
            };

            expect(goal.status).toBe('inactive');
        });
    });

    describe('Activity type', () => {
        it('should have correct structure with required fields', () => {
            const activity: Activity = {
                id: 'act-123',
                strava_id: 12345678,
                user_id: 'user-123',
                goal_id: 'goal-123',
                type: 'Run',
                distance: 10000,
                moving_time: 3600,
                total_elevation_gain: 150,
                average_speed: 2.78,
                max_speed: 4.5,
                start_date: '2026-01-13T08:00:00Z',
                created_at: '2026-01-13T10:00:00Z',
            };

            expect(activity.strava_id).toBe(12345678);
            expect(activity.distance).toBe(10000);
            expect(activity.moving_time).toBe(3600);
        });

        it('should allow null goal_id', () => {
            const activity: Activity = {
                id: 'act-456',
                strava_id: 87654321,
                user_id: 'user-123',
                goal_id: null,
                type: 'Ride',
                distance: 50000,
                moving_time: 7200,
                total_elevation_gain: 500,
                average_speed: 6.94,
                max_speed: 12.5,
                start_date: '2026-01-12T09:00:00Z',
                created_at: '2026-01-12T12:00:00Z',
            };

            expect(activity.goal_id).toBeNull();
        });

        it('should allow optional heart rate fields', () => {
            const activity: Activity = {
                id: 'act-789',
                strava_id: 11223344,
                user_id: 'user-123',
                goal_id: null,
                type: 'Run',
                distance: 5000,
                moving_time: 1800,
                total_elevation_gain: 50,
                average_speed: 2.78,
                max_speed: 3.5,
                average_heartrate: 145,
                max_heartrate: 175,
                calories: 350,
                start_date: '2026-01-13T07:00:00Z',
                created_at: '2026-01-13T08:00:00Z',
            };

            expect(activity.average_heartrate).toBe(145);
            expect(activity.max_heartrate).toBe(175);
            expect(activity.calories).toBe(350);
        });
    });

    describe('DashboardStatProps type', () => {
        it('should have correct structure', () => {
            const mockOnClick = () => { };
            const stat: DashboardStatProps = {
                title: 'Weekly Distance',
                value: '42.5',
                unit: 'km',
                icon: null as unknown as React.ReactNode,
                onClick: mockOnClick,
                isActionable: true,
            };

            expect(stat.title).toBe('Weekly Distance');
            expect(stat.value).toBe('42.5');
            expect(stat.unit).toBe('km');
            expect(stat.isActionable).toBe(true);
        });

        it('should allow optional fields', () => {
            const stat: DashboardStatProps = {
                title: 'Goals',
                value: '3',
                icon: null as unknown as React.ReactNode,
            };

            expect(stat.unit).toBeUndefined();
            expect(stat.onClick).toBeUndefined();
            expect(stat.isActionable).toBeUndefined();
        });
    });

    describe('Stats types', () => {
        it('should have correct LifetimeStats structure', () => {
            const stats: LifetimeStats = {
                distance: 1500000,
                time: 180000,
                elevation: 15000,
                calories: 75000,
                activities: 200,
                avgPace: 5.5,
            };

            expect(stats.distance).toBe(1500000);
            expect(stats.activities).toBe(200);
        });

        it('should have correct ConsistencyData structure', () => {
            const consistency: ConsistencyData = {
                score: 85,
                activeWeeks: 17,
                totalWeeks: 20,
            };

            expect(consistency.score).toBe(85);
            expect(consistency.activeWeeks).toBeLessThanOrEqual(consistency.totalWeeks);
        });

        it('should have correct StreakData structure', () => {
            const streak: StreakData = {
                current: 5,
                longest: 12,
            };

            expect(streak.current).toBeLessThanOrEqual(streak.longest);
        });
    });
});

describe('Data Transformations', () => {
    it('should convert meters to kilometers correctly', () => {
        const distanceMeters = 42195; // Marathon distance
        const distanceKm = distanceMeters / 1000;
        expect(distanceKm).toBeCloseTo(42.195, 3);
    });

    it('should calculate pace from speed correctly', () => {
        const speedMps = 3.33; // meters per second
        const paceMinPerKm = 1000 / speedMps / 60;
        expect(paceMinPerKm).toBeCloseTo(5, 0); // ~5 min/km
    });

    it('should format duration correctly', () => {
        function formatDuration(seconds: number): string {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            if (h > 0) return `${h}h ${m}m ${s}s`;
            return `${m}m ${s}s`;
        }

        expect(formatDuration(3661)).toBe('1h 1m 1s');
        expect(formatDuration(125)).toBe('2m 5s');
        expect(formatDuration(7200)).toBe('2h 0m 0s');
    });
});
