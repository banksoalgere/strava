import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { type, target, penalty, frequency = 'weekly' } = body;
        const userId = sessionUser.id;

        if (!userId || !type || !target || !penalty) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate inputs
        if (target <= 0) return NextResponse.json({ error: 'Target must be greater than 0' }, { status: 400 });
        if (penalty < 0) return NextResponse.json({ error: 'Penalty cannot be negative' }, { status: 400 });

        const goal = await prisma.goal.create({
            data: {
                userId,
                type,
                target: parseFloat(target),
                penalty: parseFloat(penalty),
                frequency,
                startDate: new Date(new Date().setHours(0, 0, 0, 0)),
                // End date could be set based on frequency, or left open-ended
            },
        });

        return NextResponse.json({ success: true, goal });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Create Goal Error:', error.message);
        }
        return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
    }
}
