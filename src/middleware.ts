
import { NextResponse, type NextRequest } from 'next/server';

// This middleware's only job is to redirect logged-in users away from auth pages.
export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/auth');

  if (sessionCookie && isAuthPage) {
    // If user is logged in and tries to access login/register, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  // Match only the authentication pages
  matcher: ['/auth/:path*'],
};
