'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const canSubmit = !!email.trim() && !!password && !loading;
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotice(null);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setNotice({ text: 'Successfully Registered! Redirecting to login...', type: 'success' });
      setTimeout(() => router.push('/login'), 800);
    } else {
      setNotice({ text: data?.error || 'Register failed', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="card card-pad">
        <h1 className="text-2xl font-semibold tracking-tight">Register</h1>
        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              disabled={loading}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              disabled={loading}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          {notice && (
            <div
              role="alert"
              className={[
                'mt-4',
                notice.type === 'success'
                  ? 'success-banner'
                  : 'error-banner',
              ].join(' ')}
            >
              {notice.text}
            </div>
          )}
          <button className="btn-primary w-full" disabled={!canSubmit}>
            {loading ? 'Registering…' : 'Register'}
          </button>
        </form>
      </div>
    </main>
  );
}