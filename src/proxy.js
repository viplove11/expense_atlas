import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const isLoggedIn = Boolean(req.auth);
  const isAuthPage = pathname.startsWith('/auth/');
  const isInternalPage = pathname === '/dashboard' || pathname.startsWith('/trips');

  if (isInternalPage && !isLoggedIn) {
    const signInUrl = new URL('/auth/signin', req.nextUrl.origin);
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/trips/:path*', '/itinerary/:path*', '/auth/:path*'],
};
