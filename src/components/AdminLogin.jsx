import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaLock, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

export const AdminLogin = ({ children }) => {
    const { isAdmin, login, register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = isRegister
            ? await register(email, password)
            : await login(email, password);

        if (!result.success) {
            setError(result.error);
        }
        setLoading(false);
    };

    if (isAdmin) {
        return children;
    }

    return (
        <div className="container flex flex-col items-center justify-center" style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <FaLock size={48} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-lg)' }} />
                <h2 style={{ marginTop: 0, marginBottom: 'var(--space-sm)' }}>Admin Access</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
                    {isRegister ? 'Create your admin account' : 'Sign in with your admin email'}
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        autoFocus
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        minLength={6}
                    />

                    {error && (
                        <p style={{
                            color: 'var(--color-error)',
                            margin: 0,
                            fontSize: '0.9rem',
                            padding: 'var(--space-sm)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: 'var(--radius-sm)'
                        }}>
                            {error}
                        </p>
                    )}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Loading...' : (
                            <>
                                {isRegister ? <FaUserPlus /> : <FaSignInAlt />}
                                {isRegister ? 'Create Account' : 'Sign In'}
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: 'var(--space-lg)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-lg)' }}>
                    <button
                        onClick={() => { setIsRegister(!isRegister); setError(''); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        {isRegister ? 'Already have an account? Sign In' : 'First time? Create Account'}
                    </button>
                </div>
            </div>
        </div>
    );
};
