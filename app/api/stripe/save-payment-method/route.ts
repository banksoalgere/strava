import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        // Authenticate user
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, paymentMethodId } = await request.json();

        if (!userId || !paymentMethodId) {
            return NextResponse.json({ error: 'userId and paymentMethodId are required' }, { status: 400 });
        }

        // Security: Ensure user can only update their own payment method
        if (userId !== sessionUser.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { error } = await supabase
            .from('users')
            .update({ payment_method_id: paymentMethodId })
            .eq('id', userId);

        if (error) throw new Error(error.message);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Save Payment Method Error:', error.message);
        }
        return NextResponse.json({ error: 'Failed to save payment method' }, { status: 500 });
    }
}
