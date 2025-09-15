import { NextRequest, NextResponse } from 'next/server'

// Pages that don't require authentication
const publicPaths = ['/api/auth/login', '/api/auth/logout', '/login']

// Check if path requires authentication
function requiresAuth(pathname: string): boolean {
  // Skip authentication for public paths
  if (publicPaths.includes(pathname)) {
    return false
  }
  
  // Skip authentication for static files
  if (pathname.includes('.') && !pathname.startsWith('/api/')) {
    return false
  }
  
  // Skip authentication for Next.js internal paths
  if (pathname.startsWith('/_next/')) {
    return false
  }
  
  return true
}

// Check if user is authenticated
function isAuthenticated(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get('auth-session')
  
  if (!sessionCookie) {
    return false
  }
  
  try {
    // Simple session validation - in production, use proper JWT or session store
    const sessionData = JSON.parse(sessionCookie.value)
    const now = Date.now()
    
    // Check if session is expired (24 hours)
    if (now > sessionData.expires) {
      return false
    }
    
    return sessionData.authenticated === true
  } catch {
    return false
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for paths that don't require auth
  if (!requiresAuth(pathname)) {
    return NextResponse.next()
  }
  
  // Check authentication
  if (!isAuthenticated(request)) {
    // Avoid redirect loop - don't redirect to login if already on login page
    if (pathname === '/login') {
      return NextResponse.next()
    }
    
    // Redirect to login page
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}