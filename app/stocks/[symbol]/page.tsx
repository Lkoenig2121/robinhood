'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import RobinhoodLogo from '@/components/RobinhoodLogo'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

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

interface ChartDataPoint {
  date: string
  price: number
  volume?: number
}

export default function StockDetailPage() {
  const router = useRouter()
  const params = useParams()
  const symbol = params?.symbol as string
  const [stock, setStock] = useState<StockDetail | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [chartRange, setChartRange] = useState<string>('1mo')
  const [quantity, setQuantity] = useState<string>('1')
  const [portfolioEntry, setPortfolioEntry] = useState<{ shares: number; averageCost: number } | null>(null)
  const [trading, setTrading] = useState(false)
  const [tradingMessage, setTradingMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check authentication
    fetch('/api/user', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) {
          router.push('/login')
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (data && data.user) {
          setUser(data.user)
        }
      })
  }, [router])

  useEffect(() => {
    if (!symbol) return

    // Fetch stock detail
    fetch(`/api/stocks/${symbol}`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch stock data')
        }
        return res.json()
      })
      .then((data) => {
        if (data.stock) {
          setStock(data.stock)
        } else {
          setError('Stock not found')
        }
      })
      .catch((err) => {
        console.error('Error fetching stock:', err)
        setError('Failed to load stock data')
      })
      .finally(() => {
        setLoading(false)
      })

    // Fetch portfolio to see if user owns this stock
    fetch('/api/portfolio', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.portfolio) {
          const entry = data.portfolio.find((e: any) => e.symbol === symbol.toUpperCase())
          if (entry) {
            setPortfolioEntry({ shares: entry.shares, averageCost: entry.averageCost })
          }
        }
      })
      .catch(console.error)
  }, [symbol])

  useEffect(() => {
    if (!symbol) return

    // Fetch chart data
    setChartLoading(true)
    fetch(`/api/stocks/${symbol}/chart?range=${chartRange}`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch chart data')
        }
        return res.json()
      })
      .then((data) => {
        if (data.data) {
          setChartData(data.data)
        }
      })
      .catch((err) => {
        console.error('Error fetching chart data:', err)
      })
      .finally(() => {
        setChartLoading(false)
      })
  }, [symbol, chartRange])

  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    })
    router.push('/login')
  }

  const handleTrade = async (action: 'buy' | 'sell') => {
    if (!stock) return

    const shares = parseInt(quantity)
    if (isNaN(shares) || shares <= 0) {
      setTradingMessage('Please enter a valid quantity')
      return
    }

    if (action === 'sell' && (!portfolioEntry || portfolioEntry.shares < shares)) {
      setTradingMessage('Insufficient shares')
      return
    }

    setTrading(true)
    setTradingMessage(null)

    try {
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          symbol: stock.symbol,
          action,
          quantity: shares,
          price: stock.price,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setTradingMessage(`Successfully ${action === 'buy' ? 'bought' : 'sold'} ${shares} share(s) of ${stock.symbol}`)
        setQuantity('1')
        
        // Update user balance
        if (data.user) {
          setUser(data.user)
        }

        // Update portfolio entry
        if (data.portfolio) {
          const entry = data.portfolio.find((e: any) => e.symbol === stock.symbol)
          if (entry) {
            setPortfolioEntry({ shares: entry.shares, averageCost: entry.averageCost })
          } else {
            setPortfolioEntry(null)
          }
        }

        // Refresh stock data
        setTimeout(() => {
          fetch(`/api/stocks/${symbol}`, {
            credentials: 'include',
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.stock) {
                setStock(data.stock)
              }
            })
        }, 1000)
      } else {
        setTradingMessage(data.message || `Failed to ${action} stock`)
      }
    } catch (err) {
      setTradingMessage('An error occurred. Please try again.')
    } finally {
      setTrading(false)
    }
  }

  const estimatedCost = stock ? parseFloat(quantity) * stock.price : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black text-xl">Loading...</div>
      </div>
    )
  }

  if (error || !stock) {
    return (
      <div className="min-h-screen bg-white text-black">
        <nav className="border-b-4 border-robinhood-green px-6 py-4 bg-white">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
              <RobinhoodLogo className="w-8 h-8" showText={true} />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="p-2 hover:bg-gray-50 rounded-full transition-all"
                title="Profile"
              >
                <svg
                  className="w-6 h-6 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-red-400 text-xl mb-4">{error || 'Stock not found'}</p>
            <Link
              href="/dashboard"
              className="text-black underline hover:text-gray-300"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <nav className="border-b-4 border-robinhood-green px-6 py-4 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
            <RobinhoodLogo className="w-8 h-8" showText={true} />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="p-2 hover:bg-gray-50 rounded-full transition-all"
              title="Profile"
            >
              <svg
                className="w-6 h-6 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-black"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Link
          href="/dashboard"
          className="text-gray-600 hover:text-black mb-6 inline-block transition-colors"
        >
          ← Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{stock.symbol}</h1>
          <p className="text-xl text-gray-600">{stock.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Price Card with Chart */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
            <div className="mb-6">
              <div className="text-gray-600 text-sm mb-1">Current Price</div>
              <div className="text-5xl font-bold mb-2">
                ${stock.price.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div
                className={`text-xl font-medium ${
                  stock.change >= 0 ? 'text-robinhood-green' : 'text-red-400'
                }`}
              >
                {stock.change >= 0 ? '+' : ''}
                {stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}
                {stock.changePercent.toFixed(2)}%)
              </div>
            </div>

            {/* Chart Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Price History</h3>
                <div className="flex gap-2">
                  {['1d', '5d', '1mo', '3mo', '6mo', '1y'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setChartRange(range)}
                      className={`px-3 py-1 text-sm rounded transition-all ${
                        chartRange === range
                          ? 'bg-robinhood-green text-black font-medium'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              {chartLoading ? (
                <div className="h-64 flex items-center justify-center text-gray-600">
                  Loading chart...
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="date"
                      stroke="#6B7280"
                      tick={{ fill: '#6B7280' }}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getMonth() + 1}/${date.getDate()}`
                      }}
                    />
                    <YAxis
                      stroke="#6B7280"
                      tick={{ fill: '#6B7280' }}
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        color: '#000',
                      }}
                      labelStyle={{ color: '#6B7280' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                      labelFormatter={(label) => {
                        const date = new Date(label)
                        return date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke={stock.change >= 0 ? '#00C805' : '#EF4444'}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-600">
                  No chart data available
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Market Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-600 text-sm mb-1">Open</div>
                  <div className="text-xl font-semibold">
                    ${stock.open.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm mb-1">Previous Close</div>
                  <div className="text-xl font-semibold">
                    ${stock.previousClose.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm mb-1">Day High</div>
                  <div className="text-xl font-semibold text-robinhood-green">
                    ${stock.high.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm mb-1">Day Low</div>
                  <div className="text-xl font-semibold text-red-400">
                    ${stock.low.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-600 text-sm mb-1">Volume</div>
                  <div className="text-xl font-semibold">
                    {stock.volume.toLocaleString('en-US')}
                  </div>
                </div>
                {stock.marketCap && (
                  <div className="col-span-2">
                    <div className="text-gray-600 text-sm mb-1">Market Cap</div>
                    <div className="text-xl font-semibold">
                      ${stock.marketCap.toLocaleString('en-US')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trade Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Trade {stock.symbol}</h3>
            {portfolioEntry && (
              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <div className="text-gray-600 text-xs mb-1">You own</div>
                <div className="text-black font-semibold">{portfolioEntry.shares} share(s)</div>
                <div className="text-gray-600 text-xs mt-1">Avg. cost: ${portfolioEntry.averageCost.toFixed(2)}</div>
              </div>
            )}
            {tradingMessage && (
              <div className={`mb-4 p-4 rounded-lg text-sm font-medium ${
                tradingMessage.includes('Successfully') 
                  ? 'bg-robinhood-green text-black' 
                  : 'bg-red-900/30 text-red-400 border border-red-700'
              }`}>
                {tradingMessage}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-robinhood-green"
                  disabled={trading}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTrade('buy')}
                  disabled={trading}
                  className="flex-1 bg-robinhood-green hover:bg-robinhood-green-dark disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium py-3 px-4 rounded-lg transition-all"
                >
                  {trading ? 'Processing...' : 'Buy'}
                </button>
                <button
                  onClick={() => handleTrade('sell')}
                  disabled={trading || !portfolioEntry || portfolioEntry.shares === 0}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all"
                >
                  Sell
                </button>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="text-gray-600 text-sm mb-2">Estimated Cost</div>
                <div className="text-xl font-semibold">
                  ${estimatedCost.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

