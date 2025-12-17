import { NextRequest, NextResponse } from 'next/server'
import { dummyAccounts } from '@/server/dummyAccounts'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value

    if (!sessionId) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = dummyAccounts.find((account) => account.id === sessionId)
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid session' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    )
  }
}

