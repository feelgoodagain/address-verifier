'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !!email.trim() && !!password && !loading;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and password cannot be empty!');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError('Login failed, please check your credentials.');
        return;
      }
      router.push('/verify');
    } catch (err) {
      if (err instanceof Error) setError('Network error, please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="card card-pad">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn-primary w-full" disabled={!canSubmit}>
            {loading ? "Login…" : "Login"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Need an account? <a className="link" href="/register">Register</a>
        </p>
      </div>
    </main>
  );
}