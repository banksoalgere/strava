import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

// Disable body parsing, we need the raw body for webhook signature verification
export const runtime = 'nodejs';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
    if (!WEBHOOK_SECRET) {
        console.error('STRIPE_WEBHOOK_SECRET is not configured');
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Webhook signature verification failed:', message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log(`✅ PaymentIntent ${paymentIntent.id} succeeded for amount ${paymentIntent.amount}`);

                // Log successful penalty charge
                const customerId = paymentIntent.customer as string;
                if (customerId) {
                    const { data: user } = await supabase
                        .from('users')
                        .select('id, email')
                        .eq('stripe_customer_id', customerId)
                        .single();

                    if (user) {
                        console.log(`Penalty charge succeeded for user ${user.id} (${user.email})`);
                        // Could add penalty_history table entry here
                    }
                }
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.error(`❌ PaymentIntent ${paymentIntent.id} failed`);

                const customerId = paymentIntent.customer as string;
                if (customerId) {
                    const { data: user } = await supabase
                        .from('users')
                        .select('id, email')
                        .eq('stripe_customer_id', customerId)
                        .single();

                    if (user) {
                        console.error(`Payment failed for user ${user.id} (${user.email}): ${paymentIntent.last_payment_error?.message}`);
                        // Could send notification email or flag account
                    }
                }
                break;
            }

            case 'setup_intent.succeeded': {
                const setupIntent = event.data.object as Stripe.SetupIntent;
                console.log(`✅ SetupIntent ${setupIntent.id} succeeded`);

                // Attach payment method to customer if not already done by client
                if (setupIntent.customer && setupIntent.payment_method) {
                    await stripe.paymentMethods.attach(
                        setupIntent.payment_method as string,
                        { customer: setupIntent.customer as string }
                    );

                    // Set as default payment method
                    await stripe.customers.update(setupIntent.customer as string, {
                        invoice_settings: {
                            default_payment_method: setupIntent.payment_method as string,
                        },
                    });
                }
                break;
            }

            case 'payment_method.attached': {
                const paymentMethod = event.data.object as Stripe.PaymentMethod;
                console.log(`✅ PaymentMethod ${paymentMethod.id} attached to customer ${paymentMethod.customer}`);
                break;
            }

            case 'customer.subscription.deleted': {
                // Handle subscription cancellation if you add subscriptions later
                const subscription = event.data.object as Stripe.Subscription;
                console.log(`Subscription ${subscription.id} was canceled`);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Webhook handler error:', message);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
