import axios from 'axios';
import { supabase } from '@/lib/supabase';

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

interface ActivityInsert {
    strava_id: number;
    user_id: string;
    goal_id: string | null;
    type: string;
    distance: number;
    moving_time: number;
    total_elevation_gain: number;
    average_speed: number;
    max_speed: number;
    average_heartrate?: number;
    max_heartrate?: number;
    calories?: number;
    start_date: string;
}

interface SyncResult {
    syncedCount: number;
    totalFetched: number;
    hasMore: boolean;
}

interface Goal {
    id: string;
    type: string;
}

async function getValidAccessToken(userId: string): Promise<string> {
    const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('access_token, refresh_token, expires_at')
        .eq('user_id', userId)
        .eq('provider', 'strava')
        .single();

    if (accountError || !account || !account.access_token) {
        throw new Error('Strava account not linked or access token missing');
    }

    // Check if expected to be expired (with buffer) or simple retry strategy on 401
    // For now, let's prioritize simple refreshing if we think it's expired OR just return token
    // Real implementation: check time.
    const now = Math.floor(Date.now() / 1000);
    if (account.expires_at && now < account.expires_at - 60) {
        return account.access_token;
    }

    console.log("Token expired or close to expiry, refreshing...");
    try {
        const refreshResponse = await axios.post('https://www.strava.com/api/v3/oauth/token', {
            client_id: process.env.STRAVA_CLIENT_ID,
            client_secret: process.env.STRAVA_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: account.refresh_token
        });

        const { access_token, refresh_token, expires_at } = refreshResponse.data;

        await supabase
            .from('accounts')
            .update({
                access_token,
                refresh_token,
                expires_at
            })
            .eq('user_id', userId)
            .eq('provider', 'strava');

        return access_token;
    } catch (err) {
        console.error("Failed to refresh token", err);
        throw new Error("Failed to refresh Strava token. Please sign in again.");
    }
}

export async function syncStravaActivities(userId: string): Promise<StravaActivity[]> {
    // 1. Get User and Goals
    const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
            *,
            goals:goals(*)
        `)
        .eq('id', userId)
        .single();

    if (userError || !user) throw new Error('User not found');

    const activeGoals = (user.goals as Goal[]) || [];

    const accessToken = await getValidAccessToken(userId);

    try {
        const response = await axios.get<StravaActivity[]>('https://www.strava.com/api/v3/athlete/activities', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
                after: Math.floor(new Date().setDate(new Date().getDate() - 7) / 1000), // last 7 days
            },
        });

        const activities = response.data;

        for (const activity of activities) {
            // Find matching goal if any
            const matchingGoal = activeGoals.find(g => activity.type === g.type || g.type === 'any');

            const activityData: ActivityInsert = {
                strava_id: activity.id,
                user_id: userId,
                goal_id: matchingGoal ? matchingGoal.id : null,
                type: activity.type,
                distance: activity.distance,
                moving_time: activity.moving_time,
                total_elevation_gain: activity.total_elevation_gain || 0,
                average_speed: activity.average_speed || 0,
                max_speed: activity.max_speed || 0,
                average_heartrate: activity.average_heartrate || undefined,
                max_heartrate: activity.max_heartrate || undefined,
                calories: activity.calories || (activity.kilojoules ? activity.kilojoules * 0.239 : undefined),
                start_date: activity.start_date, // ISO string is fine for timestamptz
            };

            await supabase
                .from('activities')
                .upsert(activityData, { onConflict: 'strava_id' });
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
    const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
            *,
            goals:goals(*)
        `)
        .eq('id', userId)
        .single();

    if (userError || !user) throw new Error('User not found');
    const activeGoals = (user.goals as Goal[]) || [];
    console.log(`[Sync Debug] User ID: ${userId}`);
    console.log(`[Sync Debug] Found ${activeGoals.length} active goals:`, JSON.stringify(activeGoals, null, 2));

    const accessToken = await getValidAccessToken(userId);

    try {
        const response = await axios.get<StravaActivity[]>('https://www.strava.com/api/v3/athlete/activities', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
                page: page,
                per_page: perPage,
            },
        });

        const activities = response.data;
        console.log(`[Sync Debug] Fetched ${activities.length} activities from Strava for page ${page}`);
        let syncedCount = 0;

        for (const activity of activities) {
            // Find matching goal if any
            const matchingGoal = activeGoals.find(g => activity.type === g.type || g.type === 'any');

            const activityData: ActivityInsert = {
                strava_id: activity.id,
                user_id: userId,
                goal_id: matchingGoal ? matchingGoal.id : null,
                type: activity.type,
                distance: activity.distance,
                moving_time: activity.moving_time,
                total_elevation_gain: activity.total_elevation_gain || 0,
                average_speed: activity.average_speed || 0,
                max_speed: activity.max_speed || 0,
                average_heartrate: activity.average_heartrate || undefined,
                max_heartrate: activity.max_heartrate || undefined,
                calories: activity.calories || (activity.kilojoules ? activity.kilojoules * 0.239 : undefined),
                start_date: activity.start_date,
            };

            await supabase
                .from('activities')
                .upsert(activityData, { onConflict: 'strava_id' });

            syncedCount++;
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
export async function checkGoalsAndCharge(userId: string) {
    // Logic to check if goals failed and trigger stripe charge
    console.log(`Checking goals for user ${userId}...`);
}
