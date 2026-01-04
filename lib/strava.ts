import axios from 'axios';
import { prisma } from '@/lib/prisma';

interface StravaActivity {
    id: number;
    type: string;
    distance: number;
    moving_time: number;
    start_date: string;
    total_elevation_gain?: number;
    average_speed?: number;
    max_speed?: number;
    average_heartrate?: number;
    max_heartrate?: number;
    calories?: number;
    kilojoules?: number;
}

interface SyncResult {
    syncedCount: number;
    totalFetched: number;
    hasMore: boolean;
}

export async function syncStravaActivities(userId: string): Promise<StravaActivity[]> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { goals: { where: { isActive: true } } },
    });

    if (!user || !user.accessToken) {
        throw new Error('User or access token not found');
    }

    try {
        const response = await axios.get<StravaActivity[]>('https://www.strava.com/api/v3/athlete/activities', {
            headers: { Authorization: `Bearer ${user.accessToken}` },
            params: {
                after: Math.floor(new Date().setDate(new Date().getDate() - 7) / 1000), // last 7 days
            },
        });

        const activities = response.data;

        for (const activity of activities) {
            for (const goal of user.goals) {
                if (activity.type === goal.type || (goal.type === 'any')) {
                    await prisma.activity.upsert({
                        where: { stravaId: BigInt(activity.id) },
                        update: {
                            totalElevationGain: activity.total_elevation_gain || 0,
                            averageSpeed: activity.average_speed || 0,
                            maxSpeed: activity.max_speed || 0,
                            averageHeartrate: activity.average_heartrate || null,
                            maxHeartrate: activity.max_heartrate || null,
                            calories: activity.calories || (activity.kilojoules ? activity.kilojoules * 0.239 : null),
                        },
                        create: {
                            stravaId: BigInt(activity.id),
                            goalId: goal.id,
                            type: activity.type,
                            distance: activity.distance,
                            movingTime: activity.moving_time,
                            totalElevationGain: activity.total_elevation_gain || 0,
                            averageSpeed: activity.average_speed || 0,
                            maxSpeed: activity.max_speed || 0,
                            averageHeartrate: activity.average_heartrate || null,
                            maxHeartrate: activity.max_heartrate || null,
                            calories: activity.calories || (activity.kilojoules ? activity.kilojoules * 0.239 : null),
                            startDate: new Date(activity.start_date),
                        },
                    });
                }
            }
        }

        return activities;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error('Strava Sync Error:', error.response?.data || error.message);
        } else {
            console.error('Strava Sync Error:', error);
        }
        throw error;
    }
}

export async function syncAllActivities(userId: string, page: number = 1, perPage: number = 30): Promise<SyncResult> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { goals: { where: { isActive: true } } },
    });

    if (!user || !user.accessToken) {
        throw new Error('User or access token not found');
    }

    try {
        const response = await axios.get<StravaActivity[]>('https://www.strava.com/api/v3/athlete/activities', {
            headers: { Authorization: `Bearer ${user.accessToken}` },
            params: {
                page: page,
                per_page: perPage,
            },
        });

        const activities = response.data;
        let syncedCount = 0;

        for (const activity of activities) {
            for (const goal of user.goals) {
                if (activity.type === goal.type || (goal.type === 'any')) {
                    await prisma.activity.upsert({
                        where: { stravaId: BigInt(activity.id) },
                        update: {
                            totalElevationGain: activity.total_elevation_gain || 0,
                            averageSpeed: activity.average_speed || 0,
                            maxSpeed: activity.max_speed || 0,
                            averageHeartrate: activity.average_heartrate || null,
                            maxHeartrate: activity.max_heartrate || null,
                            calories: activity.calories || (activity.kilojoules ? activity.kilojoules * 0.239 : null),
                        },
                        create: {
                            stravaId: BigInt(activity.id),
                            goalId: goal.id,
                            type: activity.type,
                            distance: activity.distance,
                            movingTime: activity.moving_time,
                            totalElevationGain: activity.total_elevation_gain || 0,
                            averageSpeed: activity.average_speed || 0,
                            maxSpeed: activity.max_speed || 0,
                            averageHeartrate: activity.average_heartrate || null,
                            maxHeartrate: activity.max_heartrate || null,
                            calories: activity.calories || (activity.kilojoules ? activity.kilojoules * 0.239 : null),
                            startDate: new Date(activity.start_date),
                        },
                    });
                    syncedCount++;
                    break;
                }
            }
        }

        return {
            syncedCount,
            totalFetched: activities.length,
            hasMore: activities.length === perPage
        };
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error('Strava Historical Sync Error:', error.response?.data || error.message);
        } else {
            console.error('Strava Historical Sync Error:', error);
        }
        throw error;
    }
}

// Placeholder for logic to check goals and charge users
// In a real app, this would be more complex and run via cron
export async function checkGoalsAndCharge(userId: string) {
    // Logic to check if goals failed and trigger stripe charge
    console.log(`Checking goals for user ${userId}...`);
}
