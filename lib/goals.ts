import { prisma } from '@/lib/prisma';
import { chargePenalty } from './penalties';

export async function checkGoalsAndCharge(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            goals: {
                where: { isActive: true },
                include: { activities: true },
            },
        },
    });

    if (!user) throw new Error('User not found');

    const results = [];

    for (const goal of user.goals) {
        // Simple logic: sum distance for the goal period
        const totalDistance = goal.activities.reduce((sum, act) => sum + act.distance, 0) / 1000; // to km

        if (totalDistance < goal.target) {
            // Goal missed!
            try {
                if (user.paymentMethodId) {
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
