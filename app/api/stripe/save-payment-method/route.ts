import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { userId, paymentMethodId } = await request.json();

        if (!userId || !paymentMethodId) {
            return NextResponse.json({ error: 'userId and paymentMethodId are required' }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { paymentMethodId },
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Save Payment Method Error:', error.message);
        }
        return NextResponse.json({ error: 'Failed to save payment method' }, { status: 500 });
    }
}
