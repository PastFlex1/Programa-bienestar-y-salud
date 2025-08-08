
import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { SECRET_KEY } from '@/lib/firebase/config';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/auth');

  if (!sessionCookie) {
    if (isAuthPage) {
      return NextResponse.next();
    }
    // Redirect to login if no session and not on an auth page
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // Verify the token
    await jwtVerify(sessionCookie, SECRET_KEY, { algorithms: ['HS256'] });

    // If on an auth page, redirect to dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    // Token is invalid, clear the cookie and redirect to login
    console.error('Invalid token:', error);
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('session');
    
    if (isAuthPage) {
        // If already on an auth page, just clear cookie and continue
        const res = NextResponse.next();
        res.cookies.delete('session');
        return res;
    }

    return response;
  }
}

export const config = {
  // Match all routes except for static assets, image optimization files, and Next.js internals
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
