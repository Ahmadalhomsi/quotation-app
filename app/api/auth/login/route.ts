import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { rateLimiter } from '@/lib/rate-limiter'
import { getClientIP } from '@/lib/ip-utils'

export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const clientIP = getClientIP(request)

        // Check rate limit
        const rateLimit = rateLimiter.checkRateLimit(clientIP)

        if (!rateLimit.allowed) {
            const timeUntilReset = Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
            return NextResponse.json(
                {
                    error: `Çok fazla giriş denemesi. ${Math.ceil(timeUntilReset / 60)} dakika sonra tekrar deneyin.`,
                    rateLimited: true,
                    resetTime: rateLimit.resetTime
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': '5',
                        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
                        'Retry-After': timeUntilReset.toString()
                    }
                }
            )
        }

        const { username, password } = await request.json()

        // Get credentials from environment
        const authUsername = process.env.AUTH_USERNAME
        const authPasswordHash = "$2b$12$n7de3rVyG0vCXcYFf0AgKe7bywMMZQjV06bSYd42CDu4Sr3hYiQJK"

        if (!authUsername || !authPasswordHash) {
            return NextResponse.json(
                { error: 'Sunucu yapılandırma hatası' },
                { status: 500 }
            )
        }

        console.log('Client IP:', clientIP);

        // Validate credentials
        if (username !== authUsername) {
            return NextResponse.json(
                { error: 'Geçersiz kullanıcı adı veya şifre' },
                {
                    status: 401,
                    headers: {
                        'X-RateLimit-Limit': '5',
                        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                        'X-RateLimit-Reset': rateLimit.resetTime.toString()
                    }
                }
            )
        }

        const passwordMatch = await bcrypt.compare(password, authPasswordHash)
        if (!passwordMatch) {
            return NextResponse.json(
                { error: 'Geçersiz kullanıcı adı veya şifre' },
                {
                    status: 401,
                    headers: {
                        'X-RateLimit-Limit': '5',
                        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                        'X-RateLimit-Reset': rateLimit.resetTime.toString()
                    }
                }
            )
        }

        // Successful login - reset rate limit for this IP
        rateLimiter.resetRateLimit(clientIP)

        // Create session data
        const sessionData = {
            authenticated: true,
            username: authUsername,
            expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }

        // Create response
        const response = NextResponse.json(
            { success: true, message: 'Giriş başarılı' },
            { status: 200 }
        )

        // Set session cookie
        response.cookies.set('auth-session', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 // 24 hours
        })

        return response
    } catch (error) {
        console.error('Giriş hatası:', error)
        return NextResponse.json(
            { error: 'Sunucu hatası' },
            { status: 500 }
        )
    }
}