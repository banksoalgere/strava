'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Plus, RefreshCw, AlertCircle, Loader2, ArrowUpRight, TrendingUp, CircleDollarSign, CheckCircle2, BarChart3 } from 'lucide-react';
import axios from 'axios';
import { CreateGoalModal } from '@/components/CreateGoalModal';
import { PaymentMethodModal } from '@/components/PaymentMethodModal';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

import { Goal, DashboardStatProps } from '@/types';

interface DashboardData {
    user: {
        id: string;
        email: string | null;
    };
    stats: {
        totalDistance: number;
        activeGoals: number;
        onTrackGoals: number;
        hasPaymentMethod: boolean;
    };
    goals: Goal[];
}

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [data, setData] = useState<DashboardData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const router = useRouter();

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/user/data');
            setData(response.data);
            setError(null);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || 'Failed to load dashboard data');
            } else {
                setError('Failed to load dashboard data');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Auto-sync on load to get fresh data
        handleSync();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSync = async () => {
        if (!data?.user?.id) return;
        setSyncing(true);
        try {
            await axios.post('/api/user/sync', { userId: data.user.id });
            await fetchData();
        } catch (err: unknown) {
            let msg = 'Sync failed';
            if (axios.isAxiosError(err)) {
                msg += ': ' + (err.response?.data?.error || err.message);
            } else if (err instanceof Error) {
                msg += ': ' + err.message;
            }
            alert(msg);
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#000000] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    <p className="text-white/30 text-xs font-mono tracking-widest uppercase">Initializing Protocol</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-6 opacity-80" />
                <h1 className="text-3xl font-bold mb-4 tracking-tight">Access Error</h1>
                <p className="text-white/50 mb-8 max-w-md">{error}</p>
                <Button onClick={() => window.location.href = '/'}>Return Home</Button>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-[#000000] text-white p-6 md:p-12 relative overflow-hidden">
            {/* Subtle Background Glow */}
            <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-600/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10 animate-fade-in-up">
                {/* Header */}
                <header className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-8 border-b border-white/5 pb-8">
                    <div>
                        <p className="text-orange-500 text-xs font-mono mb-2 uppercase tracking-widest">Dashboard // {data.user.email?.split('@')[0]}</p>
                        <h1 className="text-5xl font-bold tracking-tighter">Overview</h1>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" onClick={() => router.push('/dashboard/stats')} leftIcon={<BarChart3 className="w-4 h-4" />}>
                            Stats for Nerds
                        </Button>
                        <Button variant="secondary" onClick={handleSync} isLoading={syncing} leftIcon={<RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />}>
                            Sync Data
                        </Button>
                        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
                            Add Goal
                        </Button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <DashboardStat
                        title="Distance (This Week)"
                        value={data.stats.totalDistance.toFixed(1)}
                        unit="km"
                        icon={<TrendingUp className="text-orange-500" />}
                    />
                    <DashboardStat
                        title="Goals on Track"
                        value={`${data.stats.onTrackGoals}/${data.stats.activeGoals}`}
                        unit=""
                        icon={<CheckCircle2 className="text-green-500" />}
                    />
                    <DashboardStat
                        title="Payment Status"
                        value={data.stats.hasPaymentMethod ? "Active" : "Inactive"}
                        unit=""
                        icon={<CircleDollarSign className={data.stats.hasPaymentMethod ? "text-white" : "text-red-500"} />}
                        onClick={() => !data.stats.hasPaymentMethod && setIsPaymentModalOpen(true)}
                        isActionable={!data.stats.hasPaymentMethod}
                    />
                </div>

                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold tracking-tight">Active Contracts</h2>
                    <div className="h-px bg-white/10 flex-1 ml-6" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {data.goals.length > 0 ? (
                            data.goals.map((goal, i) => (
                                <motion.div
                                    key={goal.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <GoalRow goal={goal} />
                                </motion.div>
                            ))
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <Card className="text-center py-20 flex flex-col items-center border-dashed border-white/10 bg-transparent">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 text-white/20">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <p className="text-white/40 mb-6 max-w-sm">You have no active contracts. Create a goal to start holding yourself accountable.</p>
                                    <Button variant="outline" onClick={() => setIsModalOpen(true)}>Initialize Contract</Button>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <CreateGoalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
                userId={data.user.id}
                hasPaymentMethod={data.stats.hasPaymentMethod}
                onAddPayment={() => setIsPaymentModalOpen(true)}
            />

            <PaymentMethodModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={() => {
                    fetchData();
                    // Optionally show success toast
                }}
                userId={data.user.id}
            />
        </div>
    );
}

function DashboardStat({ title, value, unit, icon, onClick, isActionable }: DashboardStatProps) {
    return (
        <Card
            className={`flex flex-col justify-between h-40 group transition-all duration-300 ${isActionable ? 'cursor-pointer hover:border-orange-500 hover:bg-white/[0.03]' : 'hover:border-orange-500/30'}`}
            onClick={isActionable ? onClick : undefined}
        >
            <div className="flex justify-between items-start w-full">
                <span className={`p-2 rounded-lg bg-white/5 text-white/80 transition-colors ${isActionable ? 'group-hover:text-white group-hover:bg-white/10' : 'group-hover:text-white'}`}>{icon}</span>
                {isActionable ? (
                    <Plus className="w-4 h-4 text-white/20 group-hover:text-orange-500 transition-colors" />
                ) : (
                    <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                )}
            </div>
            <div>
                <div className="text-4xl font-bold tracking-tighter mb-1 mt-4">
                    {value}<span className="text-lg text-white/40 font-normal ml-1">{unit}</span>
                </div>
                <div className="text-xs text-white/40 font-mono uppercase tracking-wider">{title}</div>
            </div>
        </Card>
    )
}

function GoalRow({ goal }: { goal: Goal }) {
    const percentage = Math.min((goal.progress / goal.target) * 100, 100);
    const router = useRouter();

    return (
        <Card className="py-6 px-8 flex flex-col md:flex-row items-center gap-8 group hover:bg-white/[0.04]">
            <div className="flex-1 w-full md:w-auto">
                <div className="flex justify-between items-end mb-3">
                    <div className="flex items-center gap-4">
                        <div className="text-lg font-bold tracking-tight">{goal.type} Protocol</div>
                        <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-white/50">ID: {goal.id.slice(-4)}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-sm text-white/40 mr-2">Penalty</span>
                        <span className="font-mono text-red-400 font-bold">${goal.penalty}</span>
                    </div>
                </div>

                <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="absolute top-0 bottom-0 left-0 bg-white/10 w-full" />
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn(
                            "h-full rounded-full shadow-[0_0_10px_currentColor]",
                            percentage >= 100 ? "bg-green-500 text-green-500" : "bg-orange-500 text-orange-500"
                        )}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs font-mono text-white/30">
                    <span>0km</span>
                    <span className={cn("font-bold", percentage >= 100 ? "text-green-500" : "text-white")}>
                        {goal.progress.toFixed(1)} / {goal.target}km
                    </span>
                </div>
            </div>

            <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => router.push(`/dashboard/goal/${goal.id}`)}
            >
                Details
            </Button>
        </Card>
    );

}
