export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#050505] text-white py-16 px-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 tracking-tight">Terms of Service</h1>
                <p className="text-white/50 mb-8">Last updated: January 13, 2026</p>

                <div className="space-y-8 text-white/80 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using Strava Accountability ("the Service"), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, do not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">2. Description of Service</h2>
                        <p>
                            Strava Accountability is a fitness accountability application that connects to your Strava account to track your
                            running and cycling goals. You can set weekly or monthly distance targets with associated financial penalties
                            that are charged if you fail to meet your goals.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">3. Eligibility</h2>
                        <p>You must be at least 18 years old and capable of forming a binding contract to use this Service.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">4. Account Registration</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You must have a valid Strava account to use the Service</li>
                            <li>You are responsible for maintaining the confidentiality of your account</li>
                            <li>You agree to provide accurate and complete information</li>
                            <li>You are solely responsible for all activities under your account</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">5. Goals and Penalties</h2>
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                            <p className="font-bold text-red-400">Important: Financial Obligations</p>
                        </div>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>When you create a goal with a penalty, you agree to be charged the penalty amount if you fail to meet your goal</li>
                            <li>Goals are binding once created and cannot be modified or deleted during their active period</li>
                            <li>Penalties are automatically charged to your saved payment method at the end of the goal period</li>
                            <li>Maximum penalty per goal is $500 USD for your protection</li>
                            <li>You are solely responsible for setting realistic goals and penalty amounts</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">6. Payment Terms</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>All payments are processed securely through Stripe</li>
                            <li>By adding a payment method, you authorize us to charge penalties when goals are not met</li>
                            <li>Penalty charges are final and non-refundable</li>
                            <li>Failed payment attempts may result in additional fees from your payment provider</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">7. Data and Privacy</h2>
                        <p>
                            Your use of the Service is also governed by our{' '}
                            <a href="/privacy" className="text-orange-400 hover:text-orange-300 underline">Privacy Policy</a>,
                            which is incorporated into these Terms by reference.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">8. Third-Party Services</h2>
                        <p className="mb-4">The Service integrates with:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Strava:</strong> Subject to Strava's <a href="https://www.strava.com/legal/terms" className="text-orange-400 hover:text-orange-300 underline" target="_blank" rel="noopener noreferrer">Terms of Service</a></li>
                            <li><strong>Stripe:</strong> Subject to Stripe's <a href="https://stripe.com/legal" className="text-orange-400 hover:text-orange-300 underline" target="_blank" rel="noopener noreferrer">Terms of Service</a></li>
                        </ul>
                        <p className="mt-4 text-sm text-white/50">
                            We disclaim all warranties on behalf of third-party service providers, including implied warranties
                            of merchantability, fitness for a particular purpose, and non-infringement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">9. Disclaimer of Warranties</h2>
                        <p className="uppercase text-sm">
                            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES,
                            EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
                            FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">10. Limitation of Liability</h2>
                        <p className="uppercase text-sm">
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                            SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS,
                            DATA, OR OTHER INTANGIBLE LOSSES.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">11. Termination</h2>
                        <p>
                            We may terminate or suspend your access to the Service at any time, with or without cause.
                            Outstanding penalty obligations remain enforceable after termination.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">12. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms at any time. Continued use of the Service after
                            changes constitutes acceptance of the new Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-white">13. Contact</h2>
                        <p>
                            For questions about these Terms, contact us at{' '}
                            <a href="mailto:legal@stravaaccountability.app" className="text-orange-400 hover:text-orange-300 underline">
                                legal@stravaaccountability.app
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
