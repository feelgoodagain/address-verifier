'use client';
import { useEffect, useMemo, useState } from 'react';
import { gql } from '@apollo/client';
import { useLazyQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
// import GoogleMap from '@/components/google-map'
const GoogleMap = dynamic(() => import('@/components/google-map'), { ssr: false });
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

  useEffect(() => {
    localStorage.setItem('verify-form', JSON.stringify({ postcode, suburb, state }));
  }, [postcode, suburb, state]);

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
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-4 flex items-center justify-end">
        <button onClick={onLogout} className="link text-sm">Logout</button>
      </div>

      <div className="card card-pad">
        <form onSubmit={onSubmit} aria-busy={loading} className="space-y-4">
          <fieldset disabled={loading} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Postcode */}
            <div className="sm:col-span-1">
              <label className="label">Postcode</label>
              <input
                className={`input ${postcodeError ? 'border-[--color-danger] focus-visible:ring-red-100' : ''}`}
                placeholder="4 digits"
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
              {postcodeError && <p className="error-text">{postcodeError}</p>}
            </div>

            {/* Suburb */}
            <div className="sm:col-span-1">
              <label className="label">Suburb</label>
              <input
                className={`input ${suburbError ? 'border-[--color-danger] focus-visible:ring-red-100' : ''}`}
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
              {suburbError && <p className="error-text">{suburbError}</p>}
            </div>

            {/* State */}
            <div className="sm:col-span-1">
              <label className="label">State</label>
              <select
                className={`input ${stateError ? 'border-[--color-danger] focus-visible:ring-red-100' : ''}`}
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
              {stateError && <p className="error-text">{stateError}</p>}
            </div>

            <div className="sm:col-span-3">
              <button
                className="btn-primary w-full sm:w-auto"
                disabled={loading || !isFormValid}
              >
                {loading ? 'Verifying…' : 'Verify Address'}
              </button>
            </div>
          </fieldset>
        </form>


        {error && <div className="mt-4 error-banner">{String(error.message)}</div>}

        {result && (
          <div className="mt-4">
            <div className={result.success ? 'success-banner' : 'error-banner'}>
              {result.message}
            </div>

            {result.success && result.latitude != null && result.longitude != null && (
              <div className="mt-6">
                <GoogleMap lat={result.latitude} lng={result.longitude} />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
