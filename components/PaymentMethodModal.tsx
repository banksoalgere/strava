'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, AlertCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';
import axios from 'axios';

// Initialize Stripe outside of component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: string;
}

function PaymentForm({ onClose, onSuccess, userId }: { onClose: () => void, onSuccess: () => void, userId: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Create Setup Intent
            const { data: { clientSecret } } = await axios.post('/api/stripe/setup-intent', { userId });

            // 2. Confirm Card Setup
            const result = await stripe.confirmCardSetup(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                    billing_details: {
                        // In a real app, collect name/email too
                        name: 'Strava User',
                    },
                },
            });

            if (result.error) {
                setError(result.error.message || 'Payment setup failed');
            } else {
                // Save the payment method ID to the database
                const paymentMethodId = result.setupIntent.payment_method;
                await axios.post('/api/stripe/save-payment-method', {
                    userId,
                    paymentMethodId
                });

                onSuccess();
                onClose();
            }
        } catch (err: unknown) {
            console.error(err);
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || 'Something went wrong');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Something went wrong');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#ffffff',
                                fontFamily: "'Outfit', sans-serif",
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#ef4444',
                            },
                        },
                    }}
                />
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <Button type="submit" className="w-full py-4" disabled={!stripe || loading} isLoading={loading}>
                Save Payment Method
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-white/30">
                <ShieldCheck className="w-3 h-3" />
                <span>Securely processed by Stripe</span>
            </div>
        </form>
    );
}

export function PaymentMethodModal({ isOpen, onClose, onSuccess, userId }: PaymentMethodModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
                    >
                        <div className="glass-card p-0 rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 bg-[#0A0A0A]">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-20"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-8 pb-0">
                                <h2 className="text-2xl font-bold mb-2 tracking-tight">Add Payment Method</h2>
                                <p className="text-white/50 text-sm">To ensure accountability, we require a payment method on file. You will only be charged if you miss a goal.</p>
                            </div>

                            <div className="p-8 pt-6">
                                <Elements stripe={stripePromise}>
                                    <PaymentForm onClose={onClose} onSuccess={onSuccess} userId={userId} />
                                </Elements>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
