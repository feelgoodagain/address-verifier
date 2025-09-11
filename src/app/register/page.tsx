'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border w-full p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border w-full p-2" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-black text-white px-4 py-2 rounded">Register</button>
      </form>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </main>
  );
}