'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { X, Target, DollarSign, Activity } from 'lucide-react';
import axios from 'axios';

interface CreateGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: string;
    hasPaymentMethod?: boolean;
    onAddPayment?: () => void;
}

export function CreateGoalModal({ isOpen, onClose, onSuccess, userId, hasPaymentMethod = false, onAddPayment }: CreateGoalModalProps) {
    const [type, setType] = useState('Run');
    const [target, setTarget] = useState('');
    const [penalty, setPenalty] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('/api/goals', {
                userId,
                type,
                target: parseFloat(target),
                penalty: parseFloat(penalty),
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create goal', error);
            alert('Failed to create goal. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
                    >
                        <div className="glass-card p-0 rounded-3xl overflow-hidden shadow-2xl relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 to-orange-400" />

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-20"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-8 pb-0">
                                <h2 className="text-2xl font-bold mb-2 tracking-tight">New Contract</h2>
                                <p className="text-white/50 text-sm">Define your terms. No backing out.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">


                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-3">Weekly Target</label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-orange-600/5 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
                                        <input
                                            type="number"
                                            value={target}
                                            onChange={(e) => setTarget(e.target.value)}
                                            required
                                            min="0.1"
                                            step="0.1"
                                            placeholder="20.0"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all font-mono text-lg"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm font-mono">km</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-3">Staked Penalty</label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-red-600/5 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-red-500 transition-colors pointer-events-none" />
                                        <input
                                            type="number"
                                            value={penalty}
                                            onChange={(e) => setPenalty(e.target.value)}
                                            required
                                            min="1"
                                            step="1"
                                            placeholder="10"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all font-mono text-lg"
                                        />
                                    </div>
                                    {!hasPaymentMethod && parseFloat(penalty) > 0 && (
                                        <div className="mt-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-3">
                                            <div className="p-1 bg-orange-500/20 rounded-full shrink-0">
                                                <DollarSign className="w-3 h-3 text-orange-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-orange-200 mb-2">You need a payment method to stake money.</p>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full text-xs h-8"
                                                    onClick={() => {
                                                        onClose();
                                                        onAddPayment?.();
                                                    }}
                                                >
                                                    Add Payment Method
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full py-4 text-base"
                                    disabled={loading}
                                    isLoading={loading}
                                >
                                    Initialize Contract
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
