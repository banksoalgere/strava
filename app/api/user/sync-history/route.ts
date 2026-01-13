import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { syncAllActivities } from '@/lib/strava';
import { getCurrentUser } from '@/lib/auth';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { page = 1 } = body;
        const perPage = 30;

        // Fetch user from session ID, not request body (safer)
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', sessionUser.id)
            .single();

        if (error || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const result = await syncAllActivities(user.id, page, perPage);

        return NextResponse.json({
            success: true,
            syncedCount: result.syncedCount,
            totalFetched: result.totalFetched,
            hasMore: result.hasMore
        });

    } catch (error: unknown) {
        console.error('Historical Sync Error:', error);

        if (axios.isAxiosError(error)) {
            if (error.response?.status === 429) {
                return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
            }
            if (error.response?.status === 401) {
                return NextResponse.json({ error: 'Strava authentication failed. Please reconnect.' }, { status: 401 });
            }
            return NextResponse.json({ error: error.message || 'Failed to sync history' }, { status: 500 });
        }

        return NextResponse.json({ error: 'Failed to sync history' }, { status: 500 });
    }
}
