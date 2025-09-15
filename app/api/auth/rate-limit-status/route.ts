import { NextRequest, NextResponse } from 'next/server'
import { rateLimiter } from '@/lib/rate-limiter'
import { getClientIP } from '@/lib/ip-utils'

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const status = rateLimiter.getStatus(clientIP)
    
    if (!status) {
      return NextResponse.json({
        ip: clientIP,
        attempts: 0,
        remaining: 5,
        resetTime: null,
        blocked: false
      })
    }
    
    const now = Date.now()
    const timeUntilReset = Math.ceil((status.resetTime - now) / 1000)
    
    return NextResponse.json({
      ip: clientIP,
      attempts: status.attempts,
      remaining: status.remaining,
      resetTime: status.resetTime,
      timeUntilReset: timeUntilReset > 0 ? timeUntilReset : 0,
      blocked: status.remaining === 0
    })
  } catch (error) {
    console.error('Rate limit status error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}