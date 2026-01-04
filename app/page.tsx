'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CountUp } from '@/components/ui/CountUp';
import { Activity, Shield, Zap, CreditCard, ChevronRight } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 overflow-x-hidden">

      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-[var(--primary)]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border border-white/10 hover:border-[var(--primary)]/50 transition-colors cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
              </span>
              <span className="text-sm font-medium text-white/80 tracking-wide font-outfit uppercase text-[10px]">Beta Access Live</span>
            </div>

            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter mb-8 font-outfit leading-[0.9]">
              RUN OR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-orange-400">PAY</span>.
            </h1>

            <p className="text-2xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              The ultimate accountability agreement. Connect Strava. Set a goal.
              <br className="hidden md:block" /> <strong className="text-white font-medium">Miss it, and we charge you.</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button size="xl" variant="glow" onClick={() => signIn('strava', { callbackUrl: '/dashboard' })}
                rightIcon={<ChevronRight className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                Connect Strava
              </Button>
              <Button variant="secondary" size="xl" className="w-full sm:w-auto group" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                How it works
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-outfit">Built for <span className="text-[var(--primary)]">Commitment</span>.</h2>
            <p className="text-white/40 text-lg max-w-xl">Everything you need to stop making excuses and start hitting PRs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
            {/* Main Feature - Large */}
            <Card className="md:col-span-3 md:row-span-2 flex flex-col justify-between bg-gradient-to-br from-white/[0.03] to-transparent">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center mb-6 text-[var(--primary)] border border-[var(--primary)]/20">
                  <Activity className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Seamless Strava Sync</h3>
                <p className="text-white/50 text-lg leading-relaxed">
                  We automatically pull your run data. Distance, pace, and time are verified instantly against your weekly goals. No manual entry required.
                </p>
              </div>
              <div className="mt-8 relative h-40 overflow-hidden rounded-xl border border-white/5 bg-black/20">
                {/* Mock Graph or Visual */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--primary)]/20 to-transparent opacity-50" />
                <svg className="absolute bottom-0 left-0 w-full h-full text-[var(--primary)]" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path d="M0,40 L10,30 L20,35 L30,15 L40,25 L50,10 L60,20 L70,5 L80,15 L90,10 L100,20 L100,40 Z" fill="currentColor" fillOpacity="0.2" />
                  <path d="M0,40 L10,30 L20,35 L30,15 L40,25 L50,10 L60,20 L70,5 L80,15 L90,10 L100,20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </svg>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="md:col-span-3 md:row-span-1">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-500 border border-blue-500/20">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Ironclad Contracts</h3>
                  <p className="text-white/50 text-sm">Once you set a goal, it&apos;s locked. No editing, no deleting, no backing out until the week is done.</p>
                </div>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="md:col-span-2 md:row-span-1">
              <div className="h-full flex flex-col justify-center">
                <CreditCard className="w-8 h-8 text-white/80 mb-4" />
                <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
                <p className="text-white/50 text-sm">Powered by Stripe. Your data is encrypted and safe.</p>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card className="md:col-span-1 md:row-span-1 flex items-center justify-center bg-[var(--primary)] text-white relative group overflow-hidden border-none!">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-[var(--primary)] z-0" />
              <div className="relative z-10 text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-white" fill="currentColor" />
                <div className="font-bold">Just Run</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div className="space-y-2">
            <div className="text-5xl font-bold font-outfit text-white tracking-tight">
              <CountUp end={12400} prefix="$" duration={2500} />
            </div>
            <div className="text-[var(--primary)] text-sm font-medium uppercase tracking-widest">Donated to Charity</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-bold font-outfit text-white tracking-tight">
              <CountUp end={94} suffix="%" duration={2000} />
            </div>
            <div className="text-[var(--primary)] text-sm font-medium uppercase tracking-widest">Success Rate</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-bold font-outfit text-white tracking-tight">
              <CountUp end={1.2} suffix="M" decimals={1} duration={3000} />
            </div>
            <div className="text-[var(--primary)] text-sm font-medium uppercase tracking-widest">Km Tracked</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-bold font-outfit text-white tracking-tight">
              <CountUp end={5000} suffix="+" duration={2000} />
            </div>
            <div className="text-[var(--primary)] text-sm font-medium uppercase tracking-widest">Active Athletes</div>
          </div>
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="py-12 text-center text-white/20 text-sm">
        <p>&copy; {new Date().getFullYear()} Strava Accountability. All rights reserved.</p>
      </footer>
    </div>
  );
}
