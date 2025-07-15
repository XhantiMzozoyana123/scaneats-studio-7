
import {NextRequest, NextResponse} from 'next/server';

export const config = {
  // The matcher is a list of paths that the middleware will run on.
  // This will run on all paths except for the ones that start with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Define your domains
  const mainDomain = 'scaneats.app';
  const userSubdomain = 'user.scaneats.app';
  
  // For local development, you might use localhost.
  const isLocalhost = hostname.includes('localhost');

  // Route for the installation page on the main domain
  if (hostname === mainDomain) {
    // If the user is at the root of the main domain,
    // rewrite the path to show the /download page.
    url.pathname = `/download${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Route for the main user application on the subdomain
  if (hostname === userSubdomain || isLocalhost) {
    // Let the request for the user subdomain (or localhost) proceed as is.
    // The logic in /app/page.tsx will handle redirects to /login or /dashboard.
    return NextResponse.next();
  }

  // If the hostname doesn't match a defined rule, you can decide on a default behavior.
  // For now, we'll let it pass through, but you could redirect to the main domain.
  return NextResponse.next();
}
