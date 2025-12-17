import { NextRequest, NextResponse } from 'next/server'

interface StockDetail {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  volume: number
  marketCap?: number
  previousClose: number
}

async function fetchStockDetail(symbol: string): Promise<StockDetail | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch stock data')
    }

    const data = await response.json()

    if (!data.chart?.result || data.chart.result.length === 0) {
      return null
    }

    const result = data.chart.result[0]
    const meta = result.meta

    if (!meta) {
      return null
    }

    const regularMarketPrice = meta.regularMarketPrice || meta.previousClose || 0
    const previousClose = meta.previousClose || regularMarketPrice
    const change = regularMarketPrice - previousClose
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0

    return {
      symbol: meta.symbol || symbol,
      name: meta.longName || meta.shortName || symbol,
      price: parseFloat(regularMarketPrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      high: parseFloat((meta.regularMarketDayHigh || meta.previousClose || 0).toFixed(2)),
      low: parseFloat((meta.regularMarketDayLow || meta.previousClose || 0).toFixed(2)),
      open: parseFloat((meta.regularMarketOpen || meta.previousClose || 0).toFixed(2)),
      volume: meta.regularMarketVolume || 0,
      marketCap: meta.marketCap ? parseFloat(meta.marketCap.toFixed(0)) : undefined,
      previousClose: parseFloat(previousClose.toFixed(2)),
    }
  } catch (error) {
    console.error('Error fetching stock detail:', error)
    return null
  }
}

function generateMockStockDetail(symbol: string): StockDetail {
  const stockNames: { [key: string]: string } = {
    AAPL: 'Apple Inc.',
    MSFT: 'Microsoft Corporation',
    GOOGL: 'Alphabet Inc.',
    AMZN: 'Amazon.com Inc.',
    TSLA: 'Tesla, Inc.',
    META: 'Meta Platforms, Inc.',
    NVDA: 'NVIDIA Corporation',
    NFLX: 'Netflix, Inc.',
    DIS: 'The Walt Disney Company',
    V: 'Visa Inc.',
  }

  const basePrice = Math.random() * 500 + 50
  const previousClose = basePrice * (0.98 + Math.random() * 0.04)
  const change = basePrice - previousClose
  const changePercent = (change / previousClose) * 100
  const high = basePrice * (1 + Math.random() * 0.02)
  const low = basePrice * (0.98 - Math.random() * 0.02)
  const open = previousClose * (0.99 + Math.random() * 0.02)

  return {
    symbol,
    name: stockNames[symbol] || `${symbol} Inc.`,
    price: parseFloat(basePrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    high: parseFloat(high.toFixed(2)),
    low: parseFloat(low.toFixed(2)),
    open: parseFloat(open.toFixed(2)),
    volume: Math.floor(Math.random() * 100000000) + 10000000,
    marketCap: Math.floor(basePrice * 1000000000),
    previousClose: parseFloat(previousClose.toFixed(2)),
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ symbol: string }> }
) {
  try {
    const params = await context.params
    const symbol = params.symbol?.toUpperCase()

    if (!symbol) {
      return NextResponse.json(
        { message: 'Symbol is required' },
        { status: 400 }
      )
    }

    let stock = await fetchStockDetail(symbol)

    // Fallback to mock data if API fails
    if (!stock) {
      stock = generateMockStockDetail(symbol)
    }

    return NextResponse.json({ stock })
  } catch (error) {
    console.error('Error in stock detail API:', error)
    try {
      const params = await context.params
      const symbol = params.symbol?.toUpperCase() || 'UNKNOWN'
      const stock = generateMockStockDetail(symbol)
      return NextResponse.json({ stock })
    } catch {
      const stock = generateMockStockDetail('UNKNOWN')
      return NextResponse.json({ stock })
    }
  }
}

