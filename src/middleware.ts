
import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from './lib/firebase/auth';

// This middleware is now much simpler.
// It only redirects logged-in users away from auth pages.
// Route protection is handled in the dashboard layout.
export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/auth');

  if (session && isAuthPage) {
    // If user is logged in and tries to access login/register, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!session && !isAuthPage) {
    // If user is not logged in and not on an auth page, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  // Match all routes except for static assets, image optimization files, and Next.js internals
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
