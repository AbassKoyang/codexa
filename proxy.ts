import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Define protected and public routes
  const isProtectedRoute = pathname === '/' || pathname.startsWith('/editor')
  const isPublicRoute = pathname.startsWith('/login')

  // Check for common auth tokens in cookies
  // These matches what the backend (Django likely, given 8000 and sessionid) uses
  const accessToken = request.cookies.get('access')
  const refreshToken = request.cookies.get('refresh')
  const sessionId = request.cookies.get('sessionid')

  const isAuthenticated = accessToken || refreshToken || sessionId

  // Redirect to login if not authenticated and trying to access a protected route
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    // Optional: save the intended destination to redirect back after login
    // loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to home if authenticated and trying to access login page
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Match the protected routes and login route
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/',
    '/editor/:path*',
    '/login'
  ],
}
