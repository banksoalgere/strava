import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function chargePenalty(userId: string, amount: number) {
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !user || !user.stripe_customer_id || !user.payment_method_id) {
        throw new Error('User or payment method not found');
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // convert to cents
            currency: 'usd',
            customer: user.stripe_customer_id,
            payment_method: user.payment_method_id,
            off_session: true,
            confirm: true,
            description: 'Strava Accountability Penalty',
        });

        return paymentIntent;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Stripe Charge Error:', error.message);
        } else {
            console.error('Stripe Charge Error:', error);
        }
        throw error;
    }
}
