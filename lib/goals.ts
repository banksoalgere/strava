import { supabase } from '@/lib/supabase';
import { chargePenalty } from './penalties';

interface Activity {
    distance: number;
}

interface Goal {
    id: string;
    type: string;
    target: number;
    penalty: number;
    activities?: Activity[];
}

export async function checkGoalsAndCharge(userId: string) {
    // 1. Get User for payment info
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (userError || !user) throw new Error('User not found');

    // 2. Get Active Goals with Activities
    const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select(`
            *,
            activities:activities(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

    if (goalsError) throw new Error(`Error fetching goals: ${goalsError.message}`);

    const results = [];

    for (const goal of (goals as Goal[])) {
        // Simple logic: sum distance for the goal period
        // Note: activities array might be null/undefined if join failed or empty, need safety
        const activities = goal.activities || [];
        const totalDistance = activities.reduce((sum, act) => sum + act.distance, 0) / 1000; // to km

        if (totalDistance < goal.target) {
            // Goal missed!
            try {
                if (user.payment_method_id) {
                    await chargePenalty(user.id, goal.penalty);
                    results.push({ goalId: goal.id, status: 'missed', charged: true });
                } else {
                    results.push({ goalId: goal.id, status: 'missed', charged: false, error: 'No payment method' });
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                results.push({ goalId: goal.id, status: 'missed', charged: false, error: message });
            }
        } else {
            results.push({ goalId: goal.id, status: 'met', charged: false });
        }
    }

    return results;
}
