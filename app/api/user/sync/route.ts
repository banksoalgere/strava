import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncStravaActivities, checkGoalsAndCharge } from '@/lib/strava';
import { getCurrentUser } from '@/lib/auth';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Ensure user can only sync their own data
        if (userId !== sessionUser.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 1. Sync activities from Strava
        await syncStravaActivities(userId);

        // 2. Check goals and potentially charge user
        // Note: In a real scheduled job, we wouldn't rely on client-side triggering
        await checkGoalsAndCharge(userId);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 429) {
            return NextResponse.json({ error: 'Strava Rate Limit Exceeded. Please try again later.' }, { status: 429 });
        }
        console.error('Sync Error:', (error as Error).message);
        return NextResponse.json({ error: 'Failed to sync data' }, { status: 500 });
    }
}
