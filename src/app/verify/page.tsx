'use client';
import { useEffect, useState } from 'react';
import { gql } from '@apollo/client';
import { useLazyQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';

type VerifyData = {
    verifyAddress: {
        success: boolean;
        message: string;
        latitude?: number | null;
        longitude?: number | null;
    };
};
type VerifyVars = { postcode: string; suburb: string; state: string };
const VERIFY = gql`
  query Verify($postcode: String!, $suburb: String!, $state: String!) {
    verifyAddress(postcode: $postcode, suburb: $suburb, state: $state) {
      success
      message
      latitude
      longitude
    }
  }
`;

const STATES = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'];

export default function VerifyPage() {
    const [postcode, setPostcode] = useState('');
    const [suburb, setSuburb] = useState('');
    const [state, setState] = useState('VIC');

    const [runVerify, { data, loading, error }] = useLazyQuery<VerifyData, VerifyVars>(VERIFY);
    const router = useRouter();

    // recover
    useEffect(() => {
        const saved = localStorage.getItem('verify-form');
        if (saved) {
            try {
                const o = JSON.parse(saved);
                setPostcode(o.postcode || '');
                setSuburb(o.suburb || '');
                setState(o.state || '');
            } catch { }
        }
    }, []);

    // save
    useEffect(() => {
        localStorage.setItem('verify-form', JSON.stringify({ postcode, suburb, state }));
    }, [postcode, suburb, state]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await runVerify({ variables: { postcode, suburb, state } });
    };

    const onLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const result = data?.verifyAddress;

    return (
        <main className="max-w-xl mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Address Verification</h1>
                <button onClick={onLogout} className="text-sm underline">Logout</button>
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
                <input
                    className="border w-full p-2"
                    placeholder="Postcode(4 digits)"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                />
                <input
                    className="border w-full p-2"
                    placeholder="Suburb"
                    value={suburb}
                    onChange={(e) => setSuburb(e.target.value)}
                />
                <select className="border w-full p-2" value={state} onChange={(e) => setState(e.target.value)}>
                    {STATES.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>

                <button className="bg-black text-white px-4 py-2 rounded" disabled={loading}>
                    {loading ? 'verifying…' : 'verify address'}
                </button>
            </form>

            {error && <p className="mt-4 text-red-600 text-sm">request error:{String(error.message)}</p>}

            {result && (
                <div className="mt-4 p-3 border rounded">
                    <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                        {result.message}
                    </p>

                    {result.success && result.latitude && result.longitude && (
                        <div className="mt-3 text-sm text-gray-600">
                            coordinates:{result.latitude}, {result.longitude}
                            {/* integreting google maps here */}
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}