'use client';

// Global error boundary for root layout errors
// Must be a client component with html and body tags

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body style={{
                backgroundColor: '#000000',
                color: '#ffffff',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                margin: 0,
                padding: 0,
            }}>
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    textAlign: 'center',
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                    }}>
                        <span style={{ fontSize: '32px' }}>⚠️</span>
                    </div>
                    <h1 style={{
                        fontSize: '1.875rem',
                        fontWeight: 'bold',
                        marginBottom: '16px',
                    }}>
                        Something went wrong
                    </h1>
                    <p style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        marginBottom: '32px',
                    }}>
                        An unexpected error occurred.
                    </p>
                    {error?.digest && (
                        <p style={{
                            color: 'rgba(255, 255, 255, 0.3)',
                            fontSize: '0.75rem',
                            fontFamily: 'monospace',
                            marginBottom: '16px',
                        }}>
                            Error ID: {error.digest}
                        </p>
                    )}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button
                            onClick={() => reset()}
                            style={{
                                backgroundColor: '#ea580c',
                                color: '#ffffff',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '600',
                            }}
                        >
                            Try Again
                        </button>
                        <a
                            href="/"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: '#ffffff',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                fontWeight: '600',
                            }}
                        >
                            Go Home
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
}
