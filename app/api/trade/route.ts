import { NextRequest, NextResponse } from 'next/server'
import { dummyAccounts } from '@/server/dummyAccounts'
import {
  getPortfolio,
  addToPortfolio,
  removeFromPortfolio,
  getPortfolioEntry,
} from '@/server/portfolio'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { symbol, action, quantity, price } = body

    if (!symbol || !action || !quantity || !price) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (action !== 'buy' && action !== 'sell') {
      return NextResponse.json(
        { message: 'Invalid action. Must be "buy" or "sell"' },
        { status: 400 }
      )
    }

    const shares = parseInt(quantity)
    if (isNaN(shares) || shares <= 0) {
      return NextResponse.json(
        { message: 'Invalid quantity' },
        { status: 400 }
      )
    }

    const stockPrice = parseFloat(price)
    if (isNaN(stockPrice) || stockPrice <= 0) {
      return NextResponse.json(
        { message: 'Invalid price' },
        { status: 400 }
      )
    }

    const totalCost = shares * stockPrice

    if (action === 'buy') {
      // Check if user has enough balance
      if (user.balance < totalCost) {
        return NextResponse.json(
          { message: 'Insufficient funds' },
          { status: 400 }
        )
      }

      // Deduct balance and add to portfolio
      user.balance -= totalCost
      addToPortfolio(user.id, symbol.toUpperCase(), shares, stockPrice)
    } else {
      // Check if user has enough shares
      const portfolioEntry = getPortfolioEntry(user.id, symbol.toUpperCase())
      if (!portfolioEntry || portfolioEntry.shares < shares) {
        return NextResponse.json(
          { message: 'Insufficient shares' },
          { status: 400 }
        )
      }

      // Add balance and remove from portfolio
      user.balance += totalCost
      removeFromPortfolio(user.id, symbol.toUpperCase(), shares)
    }

    // Return updated user data
    const portfolio = getPortfolio(user.id)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance,
      },
      portfolio,
    })
  } catch (error) {
    console.error('Error processing trade:', error)
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    )
  }
}

