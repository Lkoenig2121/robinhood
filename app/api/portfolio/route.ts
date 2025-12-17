import { NextRequest, NextResponse } from 'next/server'
import { dummyAccounts } from '@/server/dummyAccounts'
import { getPortfolio } from '@/server/portfolio'

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

    const portfolio = getPortfolio(user.id)

    return NextResponse.json({ portfolio })
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    )
  }
}

