import { NextResponse } from 'next/server'

// Popular stock symbols
const STOCK_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
  'DIS', 'V', 'JPM', 'WMT', 'MA', 'PG', 'JNJ', 'HD', 'BAC', 'ADBE',
  'PYPL', 'NKE', 'CMCSA', 'XOM', 'CSCO', 'PFE', 'VZ', 'COST', 'MRK'
]

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

// Fetch stock data from Yahoo Finance via a free API proxy
async function fetchStockData(symbols: string[]): Promise<StockData[]> {
  try {
    // Use yahoo-finance2 npm package approach or a free API
    // For demo purposes, we'll use a public Yahoo Finance API endpoint
    const symbolsParam = symbols.join(',')
    
    // Using a free Yahoo Finance API endpoint
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbolsParam}?interval=1d&range=1d`,
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
    const results: StockData[] = []

    if (data.chart?.result) {
      data.chart.result.forEach((result: any, index: number) => {
        const symbol = result.meta?.symbol || symbols[index]
        const regularMarketPrice = result.meta?.regularMarketPrice
        const previousClose = result.meta?.previousClose
        
        if (regularMarketPrice && previousClose) {
          const change = regularMarketPrice - previousClose
          const changePercent = (change / previousClose) * 100
          
          results.push({
            symbol: symbol,
            name: result.meta?.longName || symbol,
            price: parseFloat(regularMarketPrice.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
          })
        }
      })
    }

    return results
  } catch (error) {
    console.error('Error fetching stock data:', error)
    // Return mock data if API fails
    return generateMockStockData(symbols)
  }
}

// Generate mock stock data as fallback
function generateMockStockData(symbols: string[]): StockData[] {
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

  return symbols.slice(0, 10).map((symbol) => {
    const basePrice = Math.random() * 500 + 50
    const change = (Math.random() - 0.5) * 20
    const changePercent = (change / basePrice) * 100

    return {
      symbol,
      name: stockNames[symbol] || `${symbol} Inc.`,
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
    }
  })
}

export async function GET() {
  try {
    // Get random stocks (10 stocks)
    const randomSymbols = STOCK_SYMBOLS
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)

    const stocks = await fetchStockData(randomSymbols)

    return NextResponse.json({ stocks })
  } catch (error) {
    console.error('Error in stocks API:', error)
    // Return mock data on error
    const randomSymbols = STOCK_SYMBOLS
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)
    const stocks = generateMockStockData(randomSymbols)
    return NextResponse.json({ stocks })
  }
}

