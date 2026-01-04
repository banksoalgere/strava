'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
    ArrowLeft, Loader2, TrendingUp, Calendar, Flame, Target,
    Clock, Zap, Award, BarChart3, Activity, RefreshCw, Trophy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { cn } from '@/lib/utils';

// Helper to format pace as mm:ss
function formatPace(pace: number): string {
    if (!pace || pace <= 0 || !isFinite(pace)) return '--:--';
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Helper to format time as Xh Ym
function formatTime(minutes: number): string {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
}

interface LifetimeStats {
    distance: number;
    time: number;
    elevation: number;
    calories: number;
    activities: number;
    avgPace: number;
}

interface PhysiologyStats {
    avgHeartRate: number | null;
    maxHeartRate: number | null;
}

interface AnalyticsStats {
    paceTrend: { slope: number; rSquared: number; description: string } | null;
    hrPaceCorrelation: number | null;
    predictions: { p5k: number; p10k: number; pHalf: number; pMarathon: number } | null;
}

interface StatsData {
    lifetime: LifetimeStats;
    physiology?: PhysiologyStats;
    speed?: { maxSpeed: number };
    weekly: { week: string; distance: number }[];
    monthly: { month: string; distance: number }[];
    consistency: { score: number; activeWeeks: number; totalWeeks: number };
    streaks: { current: number; longest: number };
    dayOfWeek: { day: string; count: number }[];
    hourOfDay: { hour: number; count: number }[];
    paceZones: { zone: string; count: number }[];
    calendar: { date: string; distance: number }[];
    personalRecords: {
        fastestPace: { pace: number; distance: number; date: string } | null;
        longestRun: { distance: number; time: number; date: string } | null;
        longestTime: { distance: number; time: number; date: string } | null;
    };
    analytics?: AnalyticsStats;
}

export default function StatsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StatsData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState('');

    const fetchStats = () => {
        axios.get('/api/user/stats')
            .then(res => setStats(res.data))
            .catch(err => setError(err.response?.data?.error || 'Failed to load stats'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleSyncHistory = async () => {
        setIsSyncing(true);
        setSyncStatus('Starting...');

        try {
            let page = 1;
            let hasMore = true;
            let totalSynced = 0;

            while (hasMore) {
                setSyncStatus(`Syncing page ${page}...`);
                const res = await axios.post('/api/user/sync-history', { page });
                hasMore = res.data.hasMore;
                totalSynced += res.data.syncedCount || 0;
                page++;

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 300));

                // Safety break for very large histories
                if (page > 100) break;
            }

            setSyncStatus(`Done! Synced ${totalSynced} activities`);
            fetchStats(); // Refresh stats
            setTimeout(() => {
                setIsSyncing(false);
                setSyncStatus('');
            }, 3000);

        } catch (error: unknown) {
            let msg = 'Sync failed';
            if (axios.isAxiosError(error)) {
                msg += ': ' + (error.response?.data?.error || error.message);
            }
            setSyncStatus(msg);
            setTimeout(() => {
                setIsSyncing(false);
                setSyncStatus('');
            }, 5000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#000000] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    <p className="text-white/30 text-xs font-mono tracking-widest uppercase">Crunching Numbers</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-3xl font-bold mb-4">Error</h1>
                <p className="text-white/50 mb-8">{error}</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    if (!stats) return null;

    const { lifetime, weekly, monthly, consistency, streaks, dayOfWeek, hourOfDay, paceZones, personalRecords, calendar } = stats;

    // Find max values for scaling
    const maxWeeklyDistance = Math.max(...weekly.map((w) => w.distance), 1);
    const maxMonthlyDistance = Math.max(...monthly.map((m) => m.distance), 1);
    const maxDayCount = Math.max(...dayOfWeek.map((d) => d.count), 1);
    const maxHourCount = Math.max(...hourOfDay.map((h) => h.count), 1);
    const maxPaceZone = Math.max(...paceZones.map((p) => p.count), 1);
    const maxCalendarDistance = Math.max(...calendar.map((c) => c.distance), 1);

    return (
        <div className="min-h-screen bg-[#000000] text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-600/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <header className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <Button
                            variant="ghost"
                            leftIcon={<ArrowLeft className="w-4 h-4" />}
                            onClick={() => router.back()}
                        >
                            Back to Dashboard
                        </Button>

                        <Button
                            variant="outline"
                            isLoading={isSyncing}
                            disabled={isSyncing}
                            onClick={handleSyncHistory}
                            leftIcon={<RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />}
                        >
                            {syncStatus || 'Resync History'}
                        </Button>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-2">
                        Stats for <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-500">Nerds</span>
                    </h1>
                    <p className="text-white/40 text-lg">Deep analytics. Beautiful data. Built for athletes who love numbers.</p>
                </header>

                {/* Lifetime Stats */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-orange-500" /> Lifetime Stats
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <StatCard
                            label="Total Distance"
                            value={`${lifetime.distance.toFixed(1)}`}
                            unit="km"
                            icon={<TrendingUp className="w-4 h-4" />}
                        />
                        <StatCard
                            label="Total Time"
                            value={formatTime(lifetime.time)}
                            icon={<Clock className="w-4 h-4" />}
                        />
                        <StatCard
                            label="Total Elevation"
                            value={(lifetime.elevation).toFixed(0)}
                            unit="m"
                            icon={<TrendingUp className="w-4 h-4" />}
                        />
                        <StatCard
                            label="Calories"
                            value={lifetime.calories ? lifetime.calories.toLocaleString() : '-'}
                            unit="kcal"
                            icon={<Flame className="w-4 h-4" />}
                        />
                        <StatCard
                            label="Activities"
                            value={lifetime.activities.toString()}
                            icon={<Activity className="w-4 h-4" />}
                        />
                        <StatCard
                            label="Avg Pace"
                            value={formatPace(lifetime.avgPace)}
                            unit="/km"
                            icon={<Zap className="w-4 h-4" />}
                        />
                    </div>
                </section>

                {/* Physiology Stats (Conditional) */}
                {(stats.physiology?.avgHeartRate || stats.physiology?.maxHeartRate) && (
                    <section className="mb-12">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-red-500" /> Physiology
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {stats.physiology.avgHeartRate && (
                                <StatCard
                                    label="Avg Heart Rate"
                                    value={stats.physiology.avgHeartRate.toString()}
                                    unit="bpm"
                                    icon={<Activity className="w-4 h-4" />}
                                />
                            )}
                            {stats.physiology.maxHeartRate && (
                                <StatCard
                                    label="Max Heart Rate"
                                    value={stats.physiology.maxHeartRate.toString()}
                                    unit="bpm"
                                    icon={<Flame className="w-4 h-4" />}
                                />
                            )}
                        </div>
                    </section>
                )}

                {/* Consistency & Streaks */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" /> Consistency & Streaks
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-6 text-center">
                            <div className="text-5xl font-bold text-orange-500 mb-2">{consistency.score}%</div>
                            <div className="text-xs text-white/40 uppercase tracking-widest">Consistency Score</div>
                            <div className="text-xs text-white/30 mt-1">{consistency.activeWeeks} of {consistency.totalWeeks} weeks</div>
                        </Card>
                        <Card className="p-6 text-center">
                            <div className="text-5xl font-bold text-green-500 mb-2">{streaks.current}</div>
                            <div className="text-xs text-white/40 uppercase tracking-widest">Current Streak</div>
                            <div className="text-xs text-white/30 mt-1">weeks in a row</div>
                        </Card>
                        <Card className="p-6 text-center">
                            <div className="text-5xl font-bold text-purple-500 mb-2">{streaks.longest}</div>
                            <div className="text-xs text-white/40 uppercase tracking-widest">Longest Streak</div>
                            <div className="text-xs text-white/30 mt-1">all-time best</div>
                        </Card>
                        <Card className="p-6 text-center">
                            <div className="text-5xl font-bold text-blue-500 mb-2">{Math.round(lifetime.distance / Math.max(consistency.activeWeeks, 1))}</div>
                            <div className="text-xs text-white/40 uppercase tracking-widest">Avg km/week</div>
                            <div className="text-xs text-white/30 mt-1">when active</div>
                        </Card>
                    </div>
                </section>

                {/* Personal Records */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-orange-500" /> Personal Records
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {personalRecords.fastestPace && (
                            <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
                                <div className="text-xs text-orange-400 uppercase tracking-widest mb-2">Fastest Pace</div>
                                <div className="text-4xl font-bold mb-1">{formatPace(personalRecords.fastestPace.pace)}<span className="text-lg text-white/40">/km</span></div>
                                <div className="text-xs text-white/30">{personalRecords.fastestPace.distance.toFixed(1)}km • {new Date(personalRecords.fastestPace.date).toLocaleDateString()}</div>
                            </Card>
                        )}
                        {(stats.speed?.maxSpeed || 0) > 0 && (
                            <Card className="p-6 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
                                <div className="text-xs text-red-400 uppercase tracking-widest mb-2">Top Speed</div>
                                <div className="text-4xl font-bold mb-1">{(stats.speed?.maxSpeed || 0).toFixed(1)}<span className="text-lg text-white/40">km/h</span></div>
                                <div className="text-xs text-white/30">All-time max</div>
                            </Card>
                        )}
                        {personalRecords.longestRun && (
                            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
                                <div className="text-xs text-purple-400 uppercase tracking-widest mb-2">Longest Run</div>
                                <div className="text-4xl font-bold mb-1">{personalRecords.longestRun.distance.toFixed(1)}<span className="text-lg text-white/40">km</span></div>
                                <div className="text-xs text-white/30">{formatTime(personalRecords.longestRun.time)} • {new Date(personalRecords.longestRun.date).toLocaleDateString()}</div>
                            </Card>
                        )}
                        {personalRecords.longestTime && (
                            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                                <div className="text-xs text-blue-400 uppercase tracking-widest mb-2">Longest Time</div>
                                <div className="text-4xl font-bold mb-1">{formatTime(personalRecords.longestTime.time)}</div>
                                <div className="text-xs text-white/30">{personalRecords.longestTime.distance.toFixed(1)}km • {new Date(personalRecords.longestTime.date).toLocaleDateString()}</div>
                            </Card>
                        )}
                    </div>
                </section>

                {/* Activity Calendar */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange-500" /> Activity Heatmap
                    </h2>
                    <Card className="p-6 overflow-x-auto">
                        <div className="flex gap-[3px] min-w-max">
                            {Array.from({ length: 52 }).map((_, weekIdx) => (
                                <div key={weekIdx} className="flex flex-col gap-[3px]">
                                    {Array.from({ length: 7 }).map((_, dayIdx) => {
                                        const idx = weekIdx * 7 + dayIdx;
                                        const data = calendar[idx];
                                        const intensity = data ? Math.min(data.distance / maxCalendarDistance, 1) : 0;
                                        return (
                                            <div
                                                key={dayIdx}
                                                className={cn(
                                                    "w-3 h-3 rounded-sm transition-colors",
                                                    intensity === 0 ? "bg-white/5" :
                                                        intensity < 0.25 ? "bg-orange-900/50" :
                                                            intensity < 0.5 ? "bg-orange-700/60" :
                                                                intensity < 0.75 ? "bg-orange-500/70" :
                                                                    "bg-orange-400"
                                                )}
                                                title={data ? `${data.date}: ${data.distance.toFixed(1)}km` : ''}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-white/30">
                            <span>Less</span>
                            <div className="w-3 h-3 rounded-sm bg-white/5" />
                            <div className="w-3 h-3 rounded-sm bg-orange-900/50" />
                            <div className="w-3 h-3 rounded-sm bg-orange-700/60" />
                            <div className="w-3 h-3 rounded-sm bg-orange-500/70" />
                            <div className="w-3 h-3 rounded-sm bg-orange-400" />
                            <span>More</span>
                        </div>
                    </Card>
                </section>

                {/* Analytics & Predictions */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" /> Advanced Analytics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Pace Trend */}
                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-white/50" />
                                <span className="text-xs uppercase tracking-widest text-white/50">Pace Trend</span>
                            </div>
                            {stats.analytics?.paceTrend ? (
                                <div>
                                    <div className="text-3xl font-bold mb-1">
                                        {stats.analytics.paceTrend.slope > 0 ? 'Slowing' : 'Improving'}
                                    </div>
                                    <div className="text-sm text-white/40 mb-2">
                                        Slope: {stats.analytics.paceTrend.slope.toFixed(4)}
                                    </div>
                                    <div className="text-xs text-white/30">
                                        Based on regression of all activities.
                                        <br />R² = {stats.analytics.paceTrend.rSquared.toFixed(3)}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-white/30">Not enough data for trend analysis</div>
                            )}
                        </Card>

                        {/* Efficiency Correlation */}
                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-4 h-4 text-white/50" />
                                <span className="text-xs uppercase tracking-widest text-white/50">Heart Rate vs Pace</span>
                            </div>
                            <div className="text-3xl font-bold mb-1">
                                {stats.analytics?.hrPaceCorrelation ? stats.analytics.hrPaceCorrelation.toFixed(3) : '-'}
                            </div>
                            <div className="text-sm text-white/40 mb-2">Correlation Coefficient</div>
                            <div className="text-xs text-white/30">
                                Stronger correlation means HR tracks pace closely.
                                lower (negative) values indicate efficiency (higher pace, lower HR).
                            </div>
                        </Card>

                        {/* Race Predictor */}
                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Trophy className="w-4 h-4 text-white/50" />
                                <span className="text-xs uppercase tracking-widest text-white/50">Race Predictor</span>
                            </div>
                            {stats.analytics?.predictions ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/60">5k</span>
                                        <span className="font-mono">{formatTime(stats.analytics.predictions.p5k)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/60">10k</span>
                                        <span className="font-mono">{formatTime(stats.analytics.predictions.p10k)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/60">Half Marathon</span>
                                        <span className="font-mono">{formatTime(stats.analytics.predictions.pHalf)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/60">Marathon</span>
                                        <span className="font-mono">{formatTime(stats.analytics.predictions.pMarathon)}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-white/30 text-sm">Run at least 5k to unlock predictions</div>
                            )}
                        </Card>
                    </div>
                </section>

                {/* Weekly & Monthly Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-orange-500" /> Weekly Distance
                        </h2>
                        <Card className="p-6">
                            <div className="flex items-end gap-2 h-40">
                                {weekly.map((w, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(w.distance / maxWeeklyDistance) * 100}%` }}
                                            transition={{ duration: 0.5, delay: i * 0.05 }}
                                            className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-sm min-h-[2px]"
                                        />
                                        <span className="text-[10px] text-white/30 -rotate-45 origin-center whitespace-nowrap">
                                            {new Date(w.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-500" /> Monthly Distance
                        </h2>
                        <Card className="p-6">
                            <div className="flex items-end gap-3 h-40">
                                {monthly.slice(-6).map((m, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(m.distance / maxMonthlyDistance) * 100}%` }}
                                            transition={{ duration: 0.5, delay: i * 0.1 }}
                                            className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-sm min-h-[2px]"
                                        />
                                        <span className="text-xs text-white/30">{m.month}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </section>
                </div>

                {/* Day of Week & Hour Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <section>
                        <h2 className="text-xl font-bold mb-4">Day of Week Analysis</h2>
                        <Card className="p-6">
                            <div className="space-y-3">
                                {dayOfWeek.map((d) => (
                                    <div key={d.day} className="flex items-center gap-4">
                                        <span className="w-8 text-xs font-mono text-white/50">{d.day}</span>
                                        <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(d.count / maxDayCount) * 100}%` }}
                                                transition={{ duration: 0.5 }}
                                                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                                            />
                                        </div>
                                        <span className="w-12 text-right text-xs text-white/50">{d.count} runs</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4">Pace Distribution</h2>
                        <Card className="p-6">
                            <div className="space-y-3">
                                {paceZones.map((p) => (
                                    <div key={p.zone} className="flex items-center gap-4">
                                        <span className="w-20 text-xs font-mono text-white/50">{p.zone}</span>
                                        <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(p.count / maxPaceZone) * 100}%` }}
                                                transition={{ duration: 0.5 }}
                                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                                            />
                                        </div>
                                        <span className="w-12 text-right text-xs text-white/50">{p.count}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </section>
                </div>

                {/* Hour of Day Heatmap */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold mb-4">Time of Day Analysis</h2>
                    <Card className="p-6">
                        <div className="flex items-end gap-1">
                            {hourOfDay.map((h) => (
                                <div key={h.hour} className="flex-1 flex flex-col items-center gap-2">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max((h.count / maxHourCount) * 80, 4)}px` }}
                                        transition={{ duration: 0.5, delay: h.hour * 0.02 }}
                                        className={cn(
                                            "w-full rounded-t-sm",
                                            h.hour >= 5 && h.hour < 12 ? "bg-yellow-500" :
                                                h.hour >= 12 && h.hour < 17 ? "bg-orange-500" :
                                                    h.hour >= 17 && h.hour < 21 ? "bg-purple-500" :
                                                        "bg-blue-500"
                                        )}
                                    />
                                    <div className="text-3xl font-bold font-outfit">
                                        {((stats?.speed?.maxSpeed || 0) * 3.6).toFixed(1)}
                                        <span className="text-sm font-normal text-white/50 ml-1">km/h</span>
                                    </div>
                                    <div className="h-4 mt-1 flex items-center justify-center">
                                        {h.hour % 3 === 0 && (
                                            <span className="text-[10px] leading-none text-white/30">{h.hour}:00</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center gap-6 mt-6 text-xs">
                            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-yellow-500" /> Morning</span>
                            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-orange-500" /> Afternoon</span>
                            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-500" /> Evening</span>
                            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500" /> Night</span>
                        </div>
                    </Card>
                </section>

                <footer className="text-center text-white/20 text-xs py-8">
                    Built with 🧡 for data nerds
                </footer>
            </div>
        </div>
    );
}

function StatCard({ label, value, unit, icon }: { label: string; value: string; unit?: string; icon: React.ReactNode }) {
    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 text-white/40 mb-2">
                {icon}
                <span className="text-xs uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-3xl font-bold">
                {value}
                {unit && <span className="text-lg text-white/40 font-normal ml-1">{unit}</span>}
            </div>
        </Card>
    );
}
