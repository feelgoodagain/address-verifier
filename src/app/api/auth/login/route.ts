import { NextResponse } from 'next/server';
import { esClient, USERS_INDEX } from '@/lib/elasticsearch';
import { verifyPassword, signJWT } from '@/lib/auth';
import { z, ZodError } from 'zod';

const Body = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export async function POST(req: Request) {
    try {
        const body = Body.parse(await req.json())
        const email = body.email?.trim().toLowerCase();
        const password = body.password;
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and Password cannot be empty!' },
                { status: 400 }
            );
        }
        const res = await esClient.search({
            index: USERS_INDEX,
            query: { term: { 'email.keyword': email } },
            size: 1,
        });


        const user = res.hits.hits[0]?._source as any;
        if (!user) return NextResponse.json({ error: 'user does not exist' }, { status: 401 });

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return NextResponse.json({ error: 'incorrect username or password' }, { status: 401 });

        const token = await signJWT({ email });
        const resp = NextResponse.json({ ok: true });
        resp.cookies.set('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7days
        });

        return resp;
    } catch (e: any) {
        return NextResponse.json({ error: 'Login Failed' }, { status: 400 });
    }
}