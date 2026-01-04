import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function chargePenalty(userId: string, amount: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user || !user.stripeCustomerId || !user.paymentMethodId) {
        throw new Error('User or payment method not found');
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // convert to cents
            currency: 'usd',
            customer: user.stripeCustomerId,
            payment_method: user.paymentMethodId,
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
