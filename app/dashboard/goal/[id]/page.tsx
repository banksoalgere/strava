'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Construction } from 'lucide-react';

export default function GoalDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    return (
        <div className="min-h-screen bg-[#000000] text-white p-6 md:p-12 relative overflow-hidden flex flex-col items-center justify-center">
            {/* Background Effects */}
            <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-600/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-2xl w-full text-center relative z-10">
                <Button
                    variant="ghost"
                    className="absolute left-0 top-[-60px]"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    onClick={() => router.back()}
                >
                    Back
                </Button>

                <Card className="py-20 flex flex-col items-center border-dashed border-white/10 bg-transparent">
                    <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mb-8 text-orange-500 ring-1 ring-orange-500/20">
                        <Construction className="w-10 h-10" />
                    </div>

                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Contract Details</h1>
                    <p className="text-white/40 mb-8 max-w-md mx-auto">
                        Detailed analytics and activity breakdown for this goal are coming soon. The contract is active and being monitored.
                    </p>

                    <div className="bg-white/5 px-6 py-4 rounded-xl border border-white/10 flex flex-col items-center gap-2">
                        <span className="text-xs font-mono uppercase tracking-widest text-white/30">Contract ID</span>
                        <span className="font-mono text-xl text-white/80">{id}</span>
                    </div>
                </Card>
            </div>
        </div>
    );
}
