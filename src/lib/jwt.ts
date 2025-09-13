import * as bcrypt from 'bcrypt';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const ALG = 'HS256';
export async function verifyJWT(token: string) {
  const { payload } = await jose.jwtVerify(token, JWT_SECRET);
  return payload as any;
}