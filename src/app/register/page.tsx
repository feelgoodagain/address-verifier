'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const canSubmit = !!email.trim() && !!password && !loading;
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg('Successfully Registered! Redirecting to login...');
      setTimeout(() => router.push('/login'), 800);
    } else {
      setMsg(data.error || 'Register failed');
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
            <input className="input" disabled={loading} type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" disabled={loading} type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {msg && <p className="error-text">{msg}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            { loading ? "Registering…" : "Register" }
          </button>
        </form>

      </div>
    </main>
  );
}