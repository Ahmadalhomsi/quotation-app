import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    // Get credentials from environment
    const authUsername = process.env.AUTH_USERNAME
    const authPasswordHash = process.env.AUTH_PASSWORD_HASH
    
    if (!authUsername || !authPasswordHash) {
      return NextResponse.json(
        { error: 'Sunucu yapılandırma hatası' },
        { status: 500 }
      )
    }

    console.log('Giriş denemesi:', username);
    console.log('Beklenen kullanıcı adı:', authUsername);
    console.log('Parola:', password);
    console.log('Parola Hashi:', authPasswordHash);
    
    
    
    // Validate credentials
    if (username !== authUsername) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      )
    }
    
    const passwordMatch = await bcrypt.compare(password, authPasswordHash)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      )
    }
    
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