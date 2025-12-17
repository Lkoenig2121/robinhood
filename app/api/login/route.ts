import { NextRequest, NextResponse } from 'next/server'
import { dummyAccounts } from '@/server/dummyAccounts'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, keepLoggedIn } = body

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user in dummy accounts
    const user = dummyAccounts.find(
      (account) => account.email.toLowerCase() === email.toLowerCase()
    )

    if (!user || user.password !== password) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance,
      },
    })

    // Always set session cookie, with different expiry based on keepLoggedIn
    const maxAge = keepLoggedIn
      ? 30 * 24 * 60 * 60 * 1000 // 30 days
      : 24 * 60 * 60 * 1000 // 1 day (browser session)

    response.cookies.set('session', user.id, {
      maxAge: maxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    )
  }
}

