import { NextResponse } from 'next/server';
import { esClient, USERS_INDEX, ensureIndex } from '@/lib/elasticsearch';
import { z } from 'zod';
import { hashPassword } from '@/lib/auth';

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = Body.parse(body);

    await ensureIndex(USERS_INDEX);

    const found = await esClient.search({
      index: USERS_INDEX,
      query: { term: { 'email.keyword': email } },
      size: 1,
    });
    if ((found.hits.hits?.length || 0) > 0) {
      return NextResponse.json({ error: 'User already existed.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    await esClient.index({
      index: USERS_INDEX,
      document: {
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
      },
      refresh: 'wait_for',
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'register failed' }, { status: 400 });
  }
}