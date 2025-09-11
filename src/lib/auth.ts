import * as bcrypt from 'bcrypt';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const ALG = 'HS256';

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function signJWT(payload: Record<string, any>) {
  return new jose.SignJWT(payload).setProtectedHeader({ alg: ALG }).setExpirationTime('7d').sign(JWT_SECRET);
}

export async function verifyJWT(token: string) {
  const { payload } = await jose.jwtVerify(token, JWT_SECRET);
  return payload as any;
}