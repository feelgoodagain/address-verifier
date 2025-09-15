# Address Verifier

A Next.js (App Router, TypeScript) app that lets users **register / log in** and **verify Australian addresses**.  
Verification is handled by a GraphQL API route, with logs and user data stored in **Elasticsearch**. A **Google Map** will be rendered when latitude/longitude are returned.

---

## Deployed URL

> **Production (Vercel):** `https://address-verifier-6q3u.vercel.app/`  

---

## Tech Stack

- **Next.js 15** (App Router) + **React 19**
- **GraphQL Yoga** (`/api/graphql`)
- **Apollo Client** (frontend queries/mutations)
- **Elasticsearch** (serverless client) — users & logs indices
- **JWT (HttpOnly cookie)** auth with **bcrypt** + **jose**
- **Zod** (request schema validation)
- **Tailwind CSS v4** (utility-first styling)
- **Google Maps JS API** for map preview

---

## Project Structure

```
src/
  app/
    api/
      auth/
        login/route.ts        # Issues JWT cookie
        logout/route.ts       # Clears JWT cookie
        register/route.ts     # Creates user in Elasticsearch
      graphql/route.ts        # GraphQL endpoint (verifyAddress)
    login/page.tsx
    register/page.tsx
    verify/page.tsx
    globals.css
    layout.tsx
  components/
    ApolloWrapper.tsx
    google-map.tsx
  lib/
    auth.ts                   # bcrypt + JWT sign/verify
    jwt.ts                    # verify JWT (middleware helper)
    elasticsearch.ts          # ES client + index helpers
middleware.ts                 # protects /verify based on cookie
```

Key routes:
- **/register** → create account
- **/login** → authenticate, sets `token` (HttpOnly) cookie
- **/verify** → address verification UI (calls `/api/graphql`)
- **/api/graphql** → GraphQL endpoint (`verifyAddress(postcode, suburb, state)`)

---

## Local Setup & Running

### 1) Prerequisites
- **Node.js 18+** (Node 20 LTS recommended)
- An **Elastic Cloud** (or compatible) endpoint & API key
- An **Australia Post** API (or your proxy) for postcode/suburb lookup
- (Optional) **Google Maps** API key if you want map rendering

### 2) Install dependencies
```bash
npm install
# or: pnpm install / yarn install
```

### 3) Configure environment
Create a file **.env.local** in the project root with the following variables:

```dotenv
# ==== Elasticsearch ====
ELASTIC_NODE=              # Elastic API Endpoint
ELASTIC_API_KEY=           # Elastic API key (write access)

# ==== Index naming ====
FIRSTNAME=                 # e.g. Chase
LASTNAME=                  # e.g. Zhao
# index names derive as: <first>-<last>-users and <first>-<last>-logs (lowercased)

# ==== Auth / JWT ====
JWT_SECRET=                # 32+ bytes secret for HS256
# generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# ==== Australia Post ====
AUSPOST_BASE=              # base URL to search endpoint
AUSPOST_TOKEN=             # bearer token used by graphql route

# ==== Google Maps ====
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=   
```

### 4) Run the dev server
```bash
npm run dev
# app is available at http://localhost:3000
```

### 5) Basic flow
1. Go to **/** → redirect to **/verify** when token was found, otherwise redirect to **/login** 
2. Go to **/register** → create an account  
2. Go to **/login** → sign in (sets HttpOnly `token`)  
4. Go to **/verify** → run address verification; if latitude/longitude are returned, a map appears

---

## Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

- **Development:** `npm run dev`  
- **Production (local):** `npm run build && npm start`

---

## How It Works (High Level)

- **Auth:** credentials are stored in Elasticsearch (`users` index). On login, server verifies password (`bcrypt`) and sets a signed JWT (`jose`) in an **HttpOnly** cookie (`token`).  
- **Middleware:** `middleware.ts` checks the cookie and redirects unauthenticated users away from `/verify`.  
- **Verification:** `/api/graphql` exposes `verifyAddress(postcode, suburb, state)` (GraphQL Yoga). It queries Australia Post (via `AUSPOST_BASE` + `AUSPOST_TOKEN`), normalizes the result, and logs requests to the `logs` index.  
- **Map:** `google-map.tsx` loads the Google Maps JS API using `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and renders a marker if coordinates are present.

---

## Troubleshooting

- **Login doesn’t persist locally**  
  Ensure the cookie `secure` flag is **not** forced to `true` in development (see note above). Clear cookies and retry.

- **GraphQL returns unauthorized**  
  You must be logged in so that `token` cookie is present. Also confirm `JWT_SECRET` is set.

- **Elasticsearch permission errors**  
  Verify `ELASTIC_API_KEY` has read/write access and the `ELASTIC_NODE` URL is correct.

- **Australia Post errors**  
  Check `AUSPOST_BASE/AUSPOST_TOKEN`. The Vercel region must be able to reach your endpoint/proxy.

- **Map not showing**  
  Ensure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is configured and that verification returned `latitude/longitude`.

---

## License

MIT — see [LICENSE](./LICENSE)
