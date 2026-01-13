import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

// Allowed activity types
const VALID_ACTIVITY_TYPES = ['Run', 'Ride', 'Swim', 'Walk', 'Hike', 'any'];

// Maximum penalty to protect users from extreme amounts
const MAX_PENALTY = 500;

export async function POST(request: Request) {
    try {
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { type, target, penalty, frequency = 'weekly' } = body;
        const userId = sessionUser.id;

        // Validate required fields
        if (!type || target === undefined || penalty === undefined) {
            return NextResponse.json({ error: 'Missing required fields: type, target, penalty' }, { status: 400 });
        }

        // Validate activity type
        if (!VALID_ACTIVITY_TYPES.includes(type)) {
            return NextResponse.json({
                error: `Invalid activity type. Must be one of: ${VALID_ACTIVITY_TYPES.join(', ')}`
            }, { status: 400 });
        }

        // Validate target
        const parsedTarget = parseFloat(target);
        if (isNaN(parsedTarget) || parsedTarget <= 0) {
            return NextResponse.json({ error: 'Target must be a positive number' }, { status: 400 });
        }
        if (parsedTarget > 1000) {
            return NextResponse.json({ error: 'Target cannot exceed 1000 km' }, { status: 400 });
        }

        // Validate penalty
        const parsedPenalty = parseFloat(penalty);
        if (isNaN(parsedPenalty) || parsedPenalty < 0) {
            return NextResponse.json({ error: 'Penalty must be a non-negative number' }, { status: 400 });
        }
        if (parsedPenalty > MAX_PENALTY) {
            return NextResponse.json({
                error: `Penalty cannot exceed $${MAX_PENALTY} for safety`
            }, { status: 400 });
        }

        // Validate frequency
        if (!['weekly', 'monthly'].includes(frequency)) {
            return NextResponse.json({ error: 'Frequency must be "weekly" or "monthly"' }, { status: 400 });
        }

        const { data: goal, error } = await supabase
            .from('goals')
            .insert({
                user_id: userId,
                type,
                target: parsedTarget,
                penalty: parsedPenalty,
                frequency,
                start_date: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Create Goal DB Error:', error.message);
            throw new Error(error.message);
        }

        return NextResponse.json({ success: true, goal });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Create Goal Error:', error.message);
        }
        return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
    }
}

