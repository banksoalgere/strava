import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the authenticated user's data
    const user = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        include: {
            goals: {
                include: {
                    activities: true,
                },
            },
        },
    });

    if (!user) {
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
        const validActivities = g.activities.filter(a => {
            const actDate = new Date(a.startDate);
            const goalStartDay = new Date(g.startDate);
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
            status: g.isActive ? 'active' : 'inactive',
        };
    });

    const stats = {
        totalDistance: goals.reduce((sum, g) => sum + g.progress, 0), // This is now sum of current progress
        activeGoals: user.goals.filter(g => g.isActive).length,
        onTrackGoals: goals.filter(g => g.progress >= g.target && g.status === 'active').length,
        hasPaymentMethod: !!user.paymentMethodId,
    };

    return NextResponse.json({ stats, goals, user: { id: user.id, email: user.email } });
}
