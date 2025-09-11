'use client';
import { useEffect, useMemo, useState } from 'react';
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

const STATES = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'] as const;

export default function VerifyPage() {
  const router = useRouter();

  const [postcode, setPostcode] = useState('');
  const [suburb, setSuburb] = useState('');
  const [state, setState] = useState('');

  const [postcodeError, setPostcodeError] = useState<string | null>(null);
  const [suburbError, setSuburbError] = useState<string | null>(null);
  const [stateError, setStateError] = useState<string | null>(null);

  const [runVerify, { data, loading, error }] = useLazyQuery<VerifyData, VerifyVars>(VERIFY, {
    fetchPolicy: 'no-cache',
  });

  // ---- validators ----
  const validatePostcode = (pc: string): string | null => {
    if (!pc) return 'Postcode is required.';
    if (!/^\d{4}$/.test(pc)) return 'Postcode must be 4 digits.';
    return null;
  };
  const validateSuburb = (input: string): string | null => {
    const v = input.trim();
    if (!v) return 'Suburb is required.';
    if (v.length < 2) return 'Suburb is too short.';
    if (v.length > 50) return 'Suburb is too long.';
    if (!/^[A-Za-z\s'\-]+$/.test(v)) return 'Suburb must only contain letters, spaces, hyphens, or apostrophes.';
    return null;
  };
  const validateState = (st: string): string | null => {
    if (!st) return 'State is required.';
    if (!STATES.includes(st as any)) return 'Invalid state.';
    return null;
  };

  const isFormValid = useMemo(
    () => !validatePostcode(postcode) && !validateSuburb(suburb) && !validateState(state),
    [postcode, suburb, state]
  );

  // ---- recover from localStorage ----
  useEffect(() => {
    const saved = localStorage.getItem('verify-form');
    if (saved) {
      try {
        const o = JSON.parse(saved);
        setPostcode(o.postcode || '');
        setSuburb(o.suburb || '');
        setState(o.state || '');
      } catch {}
    }
  }, []);

  // ---- persist to localStorage ----
  useEffect(() => {
    localStorage.setItem('verify-form', JSON.stringify({ postcode, suburb, state }));
  }, [postcode, suburb, state]);

  // ---- submit ----
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pcErr = validatePostcode(postcode);
    const sbErr = validateSuburb(suburb);
    const stErr = validateState(state);
    setPostcodeError(pcErr);
    setSuburbError(sbErr);
    setStateError(stErr);

    if (pcErr || sbErr || stErr) return; 

    await runVerify({ variables: { postcode, suburb, state: state.toUpperCase() } });
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

      <form onSubmit={onSubmit} className="space-y-4" aria-busy={loading}>
        <fieldset disabled={loading} className="space-y-3">
          <div>
            <input
              className={`border w-full p-2 rounded ${postcodeError ? 'border-red-500' : ''}`}
              placeholder="Postcode (4 digits)"
              inputMode="numeric"
              pattern="\d{4}"
              value={postcode}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPostcode(v);
                if (postcodeError) setPostcodeError(validatePostcode(v));
              }}
              onBlur={() => setPostcodeError(validatePostcode(postcode))}
              required
              aria-invalid={!!postcodeError}
            />
            {postcodeError && <p className="mt-1 text-red-600 text-sm">{postcodeError}</p>}
          </div>

          <div>
            <input
              className={`border w-full p-2 rounded ${suburbError ? 'border-red-500' : ''}`}
              placeholder="Suburb"
              value={suburb}
              onChange={(e) => {
                setSuburb(e.target.value);
                if (suburbError) setSuburbError(validateSuburb(e.target.value));
              }}
              onBlur={() => setSuburbError(validateSuburb(suburb))}
              required
              aria-invalid={!!suburbError}
            />
            {suburbError && <p className="mt-1 text-red-600 text-sm">{suburbError}</p>}
          </div>

          <div>
            <select
              className={`border w-full p-2 rounded ${stateError ? 'border-red-500' : ''}`}
              value={state}
              onChange={(e) => {
                const v = e.target.value.toUpperCase();
                setState(v);
                if (stateError) setStateError(validateState(v));
              }}
              onBlur={() => setStateError(validateState(state))}
              required
              aria-invalid={!!stateError}
            >
              <option value="" disabled>
                Select state…
              </option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {stateError && <p className="mt-1 text-red-600 text-sm">{stateError}</p>}
          </div>

          <button
            className={`w-full bg-black text-white px-4 py-2 rounded ${loading || !isFormValid ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-800'}`}
            disabled={loading || !isFormValid}
          >
            {loading ? 'Verifying…' : 'Verify address'}
          </button>
        </fieldset>
      </form>

      {error && <p className="mt-4 text-red-600 text-sm">{String(error.message)}</p>}

      {result && (
        <div className="mt-4 p-3 border rounded">
          <p className={result.success ? 'text-green-700' : 'text-red-700'}>
            {result.message}
          </p>

          {result.success && result.latitude != null && result.longitude != null && (
            <div className="mt-3 text-sm text-gray-600">
              coordinates: {result.latitude}, {result.longitude}
              {/* TODO: Google Maps iframe or component */}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
