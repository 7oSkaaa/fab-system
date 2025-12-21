import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaLock, FaUnlock } from 'react-icons/fa';

export const AdminLogin = ({ children }) => {
    const { isAdmin, login } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (login(password)) {
            setError('');
        } else {
            setError('Incorrect password');
            setPassword('');
        }
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
                    Enter the admin password to continue
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        autoFocus
                    />

                    {error && (
                        <p style={{ color: 'var(--color-error)', margin: 0, fontSize: '0.9rem' }}>{error}</p>
                    )}

                    <button type="submit" className="btn-primary">
                        <FaUnlock /> Unlock
                    </button>
                </form>
            </div>
        </div>
    );
};
