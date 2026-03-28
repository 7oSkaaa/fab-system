import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaLock, FaGoogle } from 'react-icons/fa';

// Wrapper for admin-only pages
export const AdminLogin = ({ children }) => {
    const { isAdmin } = useAuth();

    if (isAdmin) {
        return children;
    }

    return <LoginForm requiredRole="admin" />;
};

// Wrapper for judge/staff pages (admin OR judge can access)
export const JudgeLogin = ({ children }) => {
    const { isAdmin, isJudge } = useAuth();

    if (isAdmin || isJudge) {
        return children;
    }

    return <LoginForm requiredRole="judge" />;
};

const isInAppBrowser = () => {
    const ua = navigator.userAgent;
    return /FBAN|FBAV|FB_IAB|Instagram|WhatsApp|Line\/|MicroMessenger/.test(ua) ||
        (/iPhone|iPod|iPad/.test(ua) && !/Safari/.test(ua) && !/CriOS/.test(ua) && !/FxiOS/.test(ua));
};

// Login Form Component with Google Sign-In
const LoginForm = ({ requiredRole }) => {
    const { loginAsStaff } = useAuth();
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const inApp = isInAppBrowser();

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        const result = await loginAsStaff();
        if (!result.success) {
            setError(result.error);
        }
        setLoading(false);
    };

    const titles = {
        admin: { title: 'Admin Access', desc: 'Sign in with your authorized Google account' },
        judge: { title: 'Staff Access', desc: 'Sign in with your authorized Google account' }
    };

    return (
        <div className="container flex flex-col items-center justify-center" style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <FaLock size={48} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-lg)' }} />
                <h2 style={{ marginTop: 0, marginBottom: 'var(--space-sm)' }}>{titles[requiredRole]?.title}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
                    {titles[requiredRole]?.desc}
                </p>

                {inApp ? (
                    <div style={{
                        padding: 'var(--space-md)',
                        background: 'rgba(251, 191, 36, 0.1)',
                        border: '2px solid var(--color-warning)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-warning)',
                        fontSize: '0.9rem',
                        lineHeight: '1.6'
                    }}>
                        <p style={{ margin: '0 0 8px 0', fontWeight: '700' }}>Open in your browser to sign in</p>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Google sign-in is blocked in Messenger, Instagram, and other in-app browsers.
                            Copy the link and open it in Safari or Chrome.
                        </p>
                        <button
                            onClick={() => navigator.clipboard?.writeText(window.location.href)}
                            className="btn-secondary"
                            style={{ marginTop: 'var(--space-sm)', width: '100%' }}
                        >
                            Copy Link
                        </button>
                    </div>
                ) : (
                    <>
                        {error && (
                            <p style={{
                                color: 'var(--color-error)',
                                fontSize: '0.9rem',
                                padding: 'var(--space-sm)',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: 'var(--radius-sm)',
                                marginBottom: 'var(--space-md)'
                            }}>
                                {error}
                            </p>
                        )}

                        <button
                            onClick={handleGoogleLogin}
                            className="btn-primary"
                            disabled={loading}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <FaGoogle />
                            {loading ? 'Signing in...' : 'Sign in with Google'}
                        </button>

                        <p style={{ marginTop: 'var(--space-lg)', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                            Contact admin if you need access
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};
