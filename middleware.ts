import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const url = req.nextUrl.clone();
  const pathname = req.nextUrl.pathname;
  console.log(`Middleware: ${pathname} , token: ${token ? 'yes' : 'no'}`);
  
  if (pathname.startsWith('/verify') && !token) {
    return NextResponse.redirect(new URL('/login', url));
  }
  if (pathname === '/' && token) {
    try {
      await verifyJWT(token);
      url.pathname = "/verify";
      return NextResponse.redirect(url);
    } catch {
      
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/','/verify/:path*'],
};