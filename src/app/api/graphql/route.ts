import { createYoga, createSchema } from 'graphql-yoga';
import { verifyJWT } from '@/lib/auth';
import { esClient, LOGS_INDEX } from '@/lib/elasticsearch';

const typeDefs = /* GraphQL */ `
  type VerifyResult {
    success: Boolean!
    message: String!
    latitude: Float
    longitude: Float
  }

  type Query {
    verifyAddress(postcode: String!, suburb: String!, state: String!): VerifyResult!
  }
`;

function getCookieVal(name: string, cookieHeader: string | null) {
  if (!cookieHeader) return undefined;
  const m = cookieHeader
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${name}=`));
  return m?.slice(name.length + 1);
}

async function callAusPost(q: string, state: string) {
  const base = process.env.AUSPOST_BASE!;
  const url = new URL(base);
  url.searchParams.set('q', q);
  if (state) url.searchParams.set('state', state);

  const resp = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${process.env.AUSPOST_TOKEN}` },
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Australia Post API error ${resp.status}: ${text || resp.statusText}`);
  }

  const data = await resp.json();
  const list = Array.isArray(data?.localities?.locality)
    ? data.localities.locality
    : data?.localities?.locality
    ? [data.localities.locality]
    : [];
  return list as Array<{
    category?: string;
    id?: number;
    latitude?: number | string;
    longitude?: number | string;
    location?: string; // suburb name (UPPERCASE)
    postcode?: string | number;
    state?: string;
  }>;
}

const resolvers = {
  Query: {
    verifyAddress: async (_parent: unknown, args: any, ctx: any) => {
      const postcode = String(args.postcode || '').trim();
      const suburb = String(args.suburb || '').trim();
      const state = String(args.state || '').trim().toUpperCase();

      let success = false;
      let message = '';
      let latitude: number | undefined;
      let longitude: number | undefined;

      try {
        const byPostcode = await callAusPost(postcode, state);
        const target = suburb.toUpperCase();

        const hit = byPostcode.find(
          (x) =>
            String(x.postcode) === postcode &&
            (x.state || '').toUpperCase() === state &&
            (x.location || '').toUpperCase() === target
        );

        if (hit) {
          success = true;
          message = 'The postcode, suburb, and state input are valid.';
          if (hit.latitude != null && hit.longitude != null) {
            latitude = Number(hit.latitude);
            longitude = Number(hit.longitude);
          }
        } else {
          const bySuburb = await callAusPost(target, state);

          const suburbInState = bySuburb.some(
            (x) => (x.location || '').toUpperCase() === target && (x.state || '').toUpperCase() === state
          );

          if (!suburbInState) {
            message = `The suburb ${suburb} does not exist in the state ${state}.`;
          } else {
            message = `The postcode ${postcode} does not match the suburb ${suburb}.`;
          }
        }
      } catch (err: any) {
        message = `Australia Post request failed: ${err?.message || 'Unknown error'}`;
      }

      try {
        await esClient.index({
          index: LOGS_INDEX,
          document: {
            user: ctx?.userEmail || 'anonymous',
            postcode,
            suburb,
            state,
            timestamp: new Date().toISOString(),
            success,
            error: success ? null : message,
          },
          refresh: 'wait_for',
        });
      } catch {
        // ignore log errors
      }

      return { success, message, latitude, longitude };
    },
  },
};

const schema = createSchema({ typeDefs, resolvers });

const handler = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  context: async ({ request }) => {
    let userEmail: string | undefined;

    try {
      const token = getCookieVal('token', request.headers.get('cookie'));
      if (token) {
        const payload = await verifyJWT(token);
        userEmail = (payload as any)?.email;
      }
    } catch {
    }

    return { userEmail };
  },
});

export { handler as GET, handler as POST, handler as OPTIONS };