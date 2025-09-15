import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Çıkış başarılı' },
    { status: 200 }
  )
  
  // Clear session cookie
  response.cookies.delete('auth-session')
  
  return response
}