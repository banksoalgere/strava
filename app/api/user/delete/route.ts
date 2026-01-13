import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

/**
 * DELETE /api/user/delete
 * Allows users to delete all their data from the system
 */
export async function DELETE() {
    try {
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = sessionUser.id;
        console.log(`🗑️ User ${userId} requested account deletion`);

        // Delete in order to respect foreign key constraints

        // 1. Delete activities
        const { error: activitiesError } = await supabase
            .from('activities')
            .delete()
            .eq('user_id', userId);

        if (activitiesError) {
            console.error('Error deleting activities:', activitiesError.message);
        }

        // 2. Delete goals
        const { error: goalsError } = await supabase
            .from('goals')
            .delete()
            .eq('user_id', userId);

        if (goalsError) {
            console.error('Error deleting goals:', goalsError.message);
        }

        // 3. Delete sessions
        const { error: sessionsError } = await supabase
            .from('sessions')
            .delete()
            .eq('user_id', userId);

        if (sessionsError) {
            console.error('Error deleting sessions:', sessionsError.message);
        }

        // 4. Delete accounts
        const { error: accountsError } = await supabase
            .from('accounts')
            .delete()
            .eq('user_id', userId);

        if (accountsError) {
            console.error('Error deleting accounts:', accountsError.message);
        }

        // 5. Delete user record
        const { error: userError } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (userError) {
            throw new Error(userError.message);
        }

        console.log(`✅ Successfully deleted all data for user ${userId}`);

        return NextResponse.json({
            success: true,
            message: 'Your account and all associated data have been deleted.'
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Account deletion error:', message);
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }
}

/**
 * GET /api/user/delete
 * Returns information about what will be deleted
 */
export async function GET() {
    try {
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = sessionUser.id;

        // Count data that will be deleted
        const { count: activitiesCount } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        const { count: goalsCount } = await supabase
            .from('goals')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        return NextResponse.json({
            warning: 'This action cannot be undone.',
            dataToBeDeleted: {
                activities: activitiesCount || 0,
                goals: goalsCount || 0,
                account: 1,
                sessions: 'all',
            },
            instructions: 'Send a DELETE request to this endpoint to permanently delete all your data.'
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error getting deletion info:', message);
        return NextResponse.json({ error: 'Failed to get deletion info' }, { status: 500 });
    }
}
