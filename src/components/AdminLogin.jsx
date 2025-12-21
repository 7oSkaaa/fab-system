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

// Login Form Component with Google Sign-In
const LoginForm = ({ requiredRole }) => {
    const { loginAsStaff } = useAuth();
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

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
            </div>
        </div>
    );
};
