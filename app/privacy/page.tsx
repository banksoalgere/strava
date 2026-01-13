export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#050505] text-white py-16 px-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 tracking-tight">Privacy Policy</h1>
                <p className="text-white/50 mb-8">Last updated: January 13, 2026</p>

                <div className="space-y-8 text-white/80 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">1. Introduction</h2>
                        <p>
                            Strava Accountability ("we", "our", "us") respects your privacy and is committed to protecting your personal data.
                            This privacy policy explains how we collect, use, and safeguard your information when you use our application.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">2. Data We Collect</h2>
                        <p className="mb-4">When you connect your Strava account, we collect:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Profile Information:</strong> Your Strava user ID and email address</li>
                            <li><strong>Activity Data:</strong> Your running/cycling activities including distance, duration, pace, and date</li>
                            <li><strong>Goal Information:</strong> Goals you create within our application</li>
                            <li><strong>Payment Information:</strong> Processed securely by Stripe; we only store a reference ID</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">3. How We Use Your Data</h2>
                        <p className="mb-4">Your data is used exclusively to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Track your progress toward fitness goals you set</li>
                            <li>Display your personal statistics and achievements</li>
                            <li>Process accountability penalties if goals are not met</li>
                            <li>Improve your experience with the application</li>
                        </ul>
                        <p className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                            <strong>Important:</strong> Your data is only visible to you. We do not share, sell, or display your activity data to other users or third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">4. Data Retention</h2>
                        <p className="mb-4">We retain your data as follows:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Activity data is synced and stored for goal tracking purposes with your explicit consent</li>
                            <li>If you delete an activity from Strava, it will be removed from our system within 48 hours</li>
                            <li>You can request complete deletion of your data at any time</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">5. Strava Integration</h2>
                        <p className="mb-4">
                            We access your Strava data through the official Strava API. When you connect your account, you explicitly authorize us to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Read your activity data (runs, rides, and other workouts)</li>
                            <li>Access your basic profile information</li>
                        </ul>
                        <p className="mt-4">
                            You can revoke this access at any time by disconnecting our application in your{' '}
                            <a href="https://www.strava.com/settings/apps" className="text-orange-400 hover:text-orange-300 underline" target="_blank" rel="noopener noreferrer">
                                Strava Settings
                            </a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">6. Payment Processing</h2>
                        <p>
                            Payments are processed securely by Stripe. We never store your full credit card details.
                            We only retain a Stripe customer ID and payment method reference to process accountability charges.
                            You can manage your payment methods at any time through the application.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">7. Data Security</h2>
                        <p className="mb-4">We implement appropriate security measures including:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Encrypted data transmission (HTTPS)</li>
                            <li>Secure database storage with row-level security</li>
                            <li>Regular security audits</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">8. Your Rights</h2>
                        <p className="mb-4">You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Access:</strong> Request a copy of your data</li>
                            <li><strong>Deletion:</strong> Request complete deletion of your account and data</li>
                            <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                            <li><strong>Revoke Access:</strong> Disconnect your Strava account at any time</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">9. Third-Party Services</h2>
                        <p className="mb-4">We use the following third-party services:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Strava:</strong> For activity data (<a href="https://www.strava.com/legal/privacy" className="text-orange-400 hover:text-orange-300 underline" target="_blank" rel="noopener noreferrer">Strava Privacy Policy</a>)</li>
                            <li><strong>Stripe:</strong> For payment processing (<a href="https://stripe.com/privacy" className="text-orange-400 hover:text-orange-300 underline" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a>)</li>
                            <li><strong>Supabase:</strong> For secure data storage</li>
                            <li><strong>Vercel:</strong> For application hosting</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">10. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy or your data, please contact us at{' '}
                            <a href="mailto:privacy@stravaaccountability.app" className="text-orange-400 hover:text-orange-300 underline">
                                privacy@stravaaccountability.app
                            </a>
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10">
                    <a href="/" className="text-orange-400 hover:text-orange-300">
                        ← Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
