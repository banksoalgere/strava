export default function NotFound() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            color: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '24px',
            textAlign: 'center',
        }}>
            <h1 style={{
                fontSize: '6rem',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: '#ea580c',
            }}>
                404
            </h1>
            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '16px',
            }}>
                Page Not Found
            </h2>
            <p style={{
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: '32px',
            }}>
                The page you&apos;re looking for doesn&apos;t exist.
            </p>
            <a
                href="/"
                style={{
                    backgroundColor: '#ea580c',
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
    );
}
