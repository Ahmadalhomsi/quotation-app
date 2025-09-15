import { NextRequest } from 'next/server'

/**
 * Get the client IP address from the request
 * Handles various proxy headers and fallbacks
 */
export function getClientIP(request: NextRequest): string {
  // Try to get IP from various headers in order of preference
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIP = request.headers.get('x-real-ip')
  const xClientIP = request.headers.get('x-client-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  const xForwardedForFirst = xForwardedFor?.split(',')[0]?.trim()
  
  // Return the first valid IP found
  const ip = xForwardedForFirst || 
            xRealIP || 
            xClientIP || 
            cfConnectingIP || 
            '127.0.0.1' // Fallback for development
  
  return ip
}

/**
 * Check if an IP address is from a private network
 * Useful for allowing more lenient rate limiting for internal IPs
 */
export function isPrivateIP(ip: string): boolean {
  // IPv4 private ranges
  const privateRanges = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^127\./,                   // 127.0.0.0/8 (localhost)
    /^169\.254\./,              // 169.254.0.0/16 (link-local)
    /^fc00:/,                   // IPv6 unique local
    /^fe80:/,                   // IPv6 link-local
    /^::1$/,                    // IPv6 localhost
  ]
  
  return privateRanges.some(range => range.test(ip))
}