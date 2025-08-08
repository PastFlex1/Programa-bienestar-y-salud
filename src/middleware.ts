
import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from './lib/firebase/auth';

// This middleware's only job is to redirect logged-in users away from auth pages.
export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/auth');

  if (session && isAuthPage) {
    // If user is logged in and tries to access login/register, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  // Match only the authentication pages
  matcher: ['/auth/:path*'],
};
