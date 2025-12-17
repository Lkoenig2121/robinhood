import { NextRequest, NextResponse } from 'next/server'

interface ChartDataPoint {
  date: string
  price: number
  volume?: number
}

async function fetchHistoricalData(symbol: string, range: string = '1mo'): Promise<ChartDataPoint[]> {
  try {
    // Fetch historical data from Yahoo Finance
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${range}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch historical data')
    }

    const data = await response.json()

    if (!data.chart?.result || data.chart.result.length === 0) {
      return []
    }

    const result = data.chart.result[0]
    const timestamps = result.timestamp || []
    const quotes = result.indicators?.quote?.[0] || {}
    const closes = quotes.close || []

    const chartData: ChartDataPoint[] = timestamps.map((timestamp: number, index: number) => {
      const date = new Date(timestamp * 1000)
      return {
        date: date.toISOString().split('T')[0],
        price: closes[index] || 0,
        volume: quotes.volume?.[index] || 0,
      }
    }).filter((point: ChartDataPoint) => point.price > 0)

    return chartData
  } catch (error) {
    console.error('Error fetching historical data:', error)
    return []
  }
}

function generateMockHistoricalData(symbol: string, days: number = 30): ChartDataPoint[] {
  const basePrice = Math.random() * 500 + 50
  const data: ChartDataPoint[] = []
  const today = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Generate realistic price movements
    const variation = (Math.random() - 0.5) * 0.05 // ±2.5% variation
    const price = basePrice * (1 + variation)
    const volume = Math.floor(Math.random() * 50000000) + 10000000

    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
      volume: volume,
    })
  }

  // Smooth the data a bit
  return data.map((point, index) => {
    if (index > 0 && index < data.length - 1) {
      const avg = (data[index - 1].price + data[index + 1].price) / 2
      return {
        ...point,
        price: parseFloat(((point.price + avg) / 2).toFixed(2)),
      }
    }
    return point
  })
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ symbol: string }> }
) {
  try {
    const params = await context.params
    const symbol = params.symbol?.toUpperCase()
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '1mo'

    if (!symbol) {
      return NextResponse.json(
        { message: 'Symbol is required' },
        { status: 400 }
      )
    }

    let chartData = await fetchHistoricalData(symbol, range)

    // Fallback to mock data if API fails
    if (chartData.length === 0) {
      const days = range === '1d' ? 1 : range === '5d' ? 5 : range === '1mo' ? 30 : range === '3mo' ? 90 : range === '6mo' ? 180 : range === '1y' ? 365 : 30
      chartData = generateMockHistoricalData(symbol, days)
    }

    return NextResponse.json({ data: chartData })
  } catch (error) {
    console.error('Error in chart API:', error)
    try {
      const params = await context.params
      const symbol = params.symbol?.toUpperCase() || 'UNKNOWN'
      const chartData = generateMockHistoricalData(symbol, 30)
      return NextResponse.json({ data: chartData })
    } catch {
      const chartData = generateMockHistoricalData('UNKNOWN', 30)
      return NextResponse.json({ data: chartData })
    }
  }
}

