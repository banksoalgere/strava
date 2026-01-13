import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        // Authenticate user
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { userId } = body;

        // Security: If userId is provided, ensure it matches authenticated user
        const targetUserId = userId || sessionUser.id;
        if (targetUserId !== sessionUser.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', targetUserId)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let customerId = user.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email || undefined,
                metadata: { userId: user.id },
            });
            customerId = customer.id;

            const { error: updateError } = await supabase
                .from('users')
                .update({ stripe_customer_id: customerId })
                .eq('id', user.id);

            if (updateError) throw new Error(updateError.message);
        }

        const setupIntent = await stripe.setupIntents.create({
            customer: customerId,
            payment_method_types: ['card'],
        });

        return NextResponse.json({ clientSecret: setupIntent.client_secret });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Stripe Setup Intent Error:', error.message);
        }
        return NextResponse.json({ error: 'Failed to create setup intent' }, { status: 500 });
    }
}
