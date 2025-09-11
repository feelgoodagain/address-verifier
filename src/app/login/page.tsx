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
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Login to Address Verifier</h1>
      <form onSubmit={onSubmit} aria-busy={loading} className="space-y-3">
        <fieldset disabled={loading} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border w-full p-2 rounded mt-1"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border w-full p-2 rounded mt-1"
              placeholder="please enter your password"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm" role="alert" aria-live="polite">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full flex items-center justify-center gap-2 rounded px-4 py-2 text-white 
              ${canSubmit ? 'bg-black hover:bg-gray-800' : 'bg-gray-400 cursor-not-allowed'}`}
            aria-disabled={!canSubmit}
          >
            {loading && (
              <span
                aria-hidden="true"
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              />
            )}
            {loading ? 'login...' : 'login'}
          </button>
        </fieldset>
      </form>

      <p className="mt-4 text-sm">
        need an account? <a className="underline" href="/register">register</a>
      </p>
    </main>
  );
}