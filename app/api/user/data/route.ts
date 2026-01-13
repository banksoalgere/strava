import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

// Define explicit types matching our Supabase query result
interface Activity {
    start_date: string;
    distance: number;
    type: string;
}

interface Goal {
    id: string;
    type: string;
    target: number;
    penalty: number;
    frequency: string;
    start_date: string;
    is_active: boolean;
    activities: Activity[];
}

interface UserWithGoals {
    id: string;
    email: string | null;
    payment_method_id: string | null;
    goals: Goal[];
}

export async function GET() {
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the authenticated user's data
    const { data: userRaw, error } = await supabase
        .from('users')
        .select(`
            *,
            activities:activities(*),
            goals:goals (
                *,
                activities:activities(*)
            )
        `)
        .eq('id', sessionUser.id)
        .single();

    const user = userRaw as unknown as (UserWithGoals & { activities: Activity[] }) | null;

    if (error || !user) {
        return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const goals = user.goals.map(g => {
        // Calculate progress based on frequency
        const periodStart = g.frequency === 'monthly' ? startOfMonth : startOfWeek;

        // Filter activities that are within the current period AND after the goal start date (inclusive of start day)
        // Filter activities that are within the current period AND after the goal start date (inclusive of start day)
        // AND match the goal type
        const allActivities = user.activities || [];
        const validActivities = allActivities.filter(a => {
            // Check type match
            if (g.type !== 'any' && a.type !== g.type) return false;

            const actDate = new Date(a.start_date);
            const goalStartDay = new Date(g.start_date);
            goalStartDay.setHours(0, 0, 0, 0);

            return actDate >= periodStart && actDate >= goalStartDay;
        });

        const currentProgress = validActivities.reduce((sum, act) => sum + act.distance, 0) / 1000;

        return {
            id: g.id,
            type: g.type,
            target: g.target,
            penalty: g.penalty,
            progress: currentProgress,
            status: g.is_active ? 'active' : 'inactive',
        };
    });

    // Calculate total distance for this week from ALL activities
    const allActivities = user.activities || [];
    const thisWeekActivities = allActivities.filter(a => {
        const actDate = new Date(a.start_date);
        return actDate >= startOfWeek;
    });
    const totalDistanceThisWeek = thisWeekActivities.reduce((sum, act) => sum + act.distance, 0) / 1000;


    const stats = {
        totalDistance: totalDistanceThisWeek,
        activeGoals: user.goals.filter(g => g.is_active).length,
        onTrackGoals: goals.filter(g => g.progress >= g.target && g.status === 'active').length,
        hasPaymentMethod: !!user.payment_method_id,
    };

    return NextResponse.json({ stats, goals, user: { id: user.id, email: user.email } });
}
