import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Strava Webhook Handler
 * 
 * Handles Strava webhook events including:
 * - Subscription validation (hub.challenge)
 * - Athlete deauthorization (athlete data deletion)
 * - Activity events (create, update, delete)
 * 
 * Configure webhook at: https://developers.strava.com/docs/webhooks/
 */

// Webhook verification token (set this in your Strava webhook subscription)
const VERIFY_TOKEN = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || 'strava-accountability-verify';

// GET: Webhook subscription validation
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // Validate subscription
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ Strava webhook subscription validated');
        return NextResponse.json({ 'hub.challenge': challenge });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// POST: Handle webhook events
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            object_type,     // 'athlete' or 'activity'
            object_id,       // Strava ID of the object
            aspect_type,     // 'create', 'update', or 'delete'
            owner_id,        // Strava athlete ID
            subscription_id,
            event_time,
        } = body;

        console.log(`📥 Strava webhook: ${object_type} ${aspect_type} for owner ${owner_id}`);

        // Handle athlete deauthorization (user removed our app)
        if (object_type === 'athlete' && aspect_type === 'update') {
            // Check if this is a deauthorization event
            if (body.updates?.authorized === 'false') {
                await handleDeauthorization(owner_id);
            }
        }

        // Handle activity deletion from Strava
        if (object_type === 'activity' && aspect_type === 'delete') {
            await handleActivityDeletion(object_id);
        }

        // Handle activity updates (optional: sync updated data)
        if (object_type === 'activity' && aspect_type === 'update') {
            // Could trigger a re-sync of this activity
            console.log(`Activity ${object_id} was updated on Strava`);
        }

        return NextResponse.json({ received: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Strava webhook error:', message);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}

/**
 * Handle athlete deauthorization
 * Delete all user data when they revoke access (within 48 hours requirement)
 */
async function handleDeauthorization(stravaAthleteId: number) {
    console.log(`🗑️ Processing deauthorization for Strava athlete ${stravaAthleteId}`);

    try {
        // Find user by Strava ID
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('strava_id', stravaAthleteId)
            .single();

        if (userError || !user) {
            console.log(`User with Strava ID ${stravaAthleteId} not found`);
            return;
        }

        // Delete user's activities
        const { error: activitiesError } = await supabase
            .from('activities')
            .delete()
            .eq('user_id', user.id);

        if (activitiesError) {
            console.error('Error deleting activities:', activitiesError.message);
        }

        // Delete user's goals
        const { error: goalsError } = await supabase
            .from('goals')
            .delete()
            .eq('user_id', user.id);

        if (goalsError) {
            console.error('Error deleting goals:', goalsError.message);
        }

        // Delete user's sessions
        const { error: sessionsError } = await supabase
            .from('sessions')
            .delete()
            .eq('user_id', user.id);

        if (sessionsError) {
            console.error('Error deleting sessions:', sessionsError.message);
        }

        // Delete user's accounts
        const { error: accountsError } = await supabase
            .from('accounts')
            .delete()
            .eq('user_id', user.id);

        if (accountsError) {
            console.error('Error deleting accounts:', accountsError.message);
        }

        // Delete user record
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', user.id);

        if (deleteError) {
            console.error('Error deleting user:', deleteError.message);
        } else {
            console.log(`✅ Successfully deleted all data for user ${user.id}`);
        }
    } catch (error) {
        console.error('Deauthorization handler error:', error);
    }
}

/**
 * Handle activity deletion from Strava
 * Must delete within 48 hours per Strava API Agreement
 */
async function handleActivityDeletion(stravaActivityId: number) {
    console.log(`🗑️ Deleting activity ${stravaActivityId} (deleted from Strava)`);

    const { error } = await supabase
        .from('activities')
        .delete()
        .eq('strava_id', stravaActivityId);

    if (error) {
        console.error('Error deleting activity:', error.message);
    } else {
        console.log(`✅ Activity ${stravaActivityId} deleted`);
    }
}
