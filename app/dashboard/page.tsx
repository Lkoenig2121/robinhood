'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  balance: number
}

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface PortfolioEntry {
  symbol: string
  shares: number
  averageCost: number
  currentPrice?: number
  currentValue?: number
  totalCost?: number
  gainLoss?: number
  gainLossPercent?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [stocks, setStocks] = useState<Stock[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [stocksLoading, setStocksLoading] = useState(true)
  const [portfolioLoading, setPortfolioLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    fetch('/api/user', {
      credentials: 'include',
    })
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
        } else {
          router.push('/login')
        }
      })
      .catch(() => {
        router.push('/login')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [router])

  useEffect(() => {
    // Fetch stocks
    setStocksLoading(true)
    fetch('/api/stocks', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.stocks) {
          setStocks(data.stocks)
        }
      })
      .catch((err) => {
        console.error('Error fetching stocks:', err)
      })
      .finally(() => {
        setStocksLoading(false)
      })

    // Fetch portfolio
    setPortfolioLoading(true)
    fetch('/api/portfolio', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.portfolio && data.portfolio.length > 0) {
          // Fetch current prices for each portfolio item
          const portfolioPromises = data.portfolio.map((entry: PortfolioEntry) =>
            fetch(`/api/stocks/${entry.symbol}`, {
              credentials: 'include',
            })
              .then((res) => res.json())
              .then((stockData) => {
                if (stockData.stock) {
                  const currentPrice = stockData.stock.price
                  const currentValue = entry.shares * currentPrice
                  const totalCost = entry.shares * entry.averageCost
                  const gainLoss = currentValue - totalCost
                  const gainLossPercent = (gainLoss / totalCost) * 100

                  return {
                    ...entry,
                    currentPrice,
                    currentValue,
                    totalCost,
                    gainLoss,
                    gainLossPercent,
                  }
                }
                return entry
              })
              .catch(() => entry)
          )

          Promise.all(portfolioPromises).then((enrichedPortfolio) => {
            setPortfolio(enrichedPortfolio)
          })
        } else {
          setPortfolio([])
        }
      })
      .catch((err) => {
        console.error('Error fetching portfolio:', err)
      })
      .finally(() => {
        setPortfolioLoading(false)
      })
  }, [])

  const handleLogout = async () => {
    await fetch('/api/logout', { 
      method: 'POST',
      credentials: 'include'
    })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold hover:text-gray-300">
            Robinhood
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="p-2 hover:bg-white/10 rounded-full transition-all"
              title="Profile"
            >
              <svg
                className="w-6 h-6 text-white"
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
              className="px-4 py-2 border border-white rounded-lg hover:bg-white/10 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold mb-2">
            Welcome back, {user.firstName}!
          </h2>
          <p className="text-gray-400">{user.email}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <div className="text-gray-400 text-sm mb-1">Cash Balance</div>
          <div className="text-4xl font-bold">
            ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Portfolio Section */}
        {portfolioLoading ? (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Your Portfolio</h3>
            <div className="text-center py-8 text-gray-400">
              <p>Loading portfolio...</p>
            </div>
          </div>
        ) : portfolio.length > 0 ? (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Your Portfolio</h3>
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800 border-b border-gray-700">
                    <tr>
                      <th className="text-left px-6 py-3 text-gray-400 text-sm font-medium">Symbol</th>
                      <th className="text-right px-6 py-3 text-gray-400 text-sm font-medium">Shares</th>
                      <th className="text-right px-6 py-3 text-gray-400 text-sm font-medium">Avg. Cost</th>
                      <th className="text-right px-6 py-3 text-gray-400 text-sm font-medium">Current Price</th>
                      <th className="text-right px-6 py-3 text-gray-400 text-sm font-medium">Market Value</th>
                      <th className="text-right px-6 py-3 text-gray-400 text-sm font-medium">Gain/Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((entry) => {
                      const totalValue = entry.currentValue || entry.shares * (entry.averageCost || 0)
                      const totalCost = entry.totalCost || entry.shares * entry.averageCost
                      const gainLoss = entry.gainLoss !== undefined ? entry.gainLoss : totalValue - totalCost
                      const gainLossPercent = entry.gainLossPercent !== undefined 
                        ? entry.gainLossPercent 
                        : totalCost > 0 ? (gainLoss / totalCost) * 100 : 0

                      return (
                        <tr
                          key={entry.symbol}
                          className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/stocks/${entry.symbol}`)}
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-white">{entry.symbol}</div>
                          </td>
                          <td className="px-6 py-4 text-right text-white">{entry.shares}</td>
                          <td className="px-6 py-4 text-right text-gray-300">
                            ${entry.averageCost.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right text-white">
                            ${entry.currentPrice?.toFixed(2) || entry.averageCost.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right text-white font-semibold">
                            ${totalValue.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className={`font-semibold ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {gainLoss >= 0 ? '+' : ''}
                              ${gainLoss.toFixed(2)} ({gainLossPercent >= 0 ? '+' : ''}
                              {gainLossPercent.toFixed(2)}%)
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {/* Portfolio Section */}
        {portfolioLoading ? (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Your Portfolio</h3>
            <div className="text-center py-8 text-gray-400">
              <p>Loading portfolio...</p>
            </div>
          </div>
        ) : portfolio.length > 0 ? (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Your Portfolio</h3>
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800 border-b border-gray-700">
                    <tr>
                      <th className="text-left px-6 py-3 text-gray-400 text-sm font-medium">Symbol</th>
                      <th className="text-right px-6 py-3 text-gray-400 text-sm font-medium">Shares</th>
                      <th className="text-right px-6 py-3 text-gray-400 text-sm font-medium">Avg. Cost</th>
                      <th className="text-right px-6 py-3 text-gray-400 text-sm font-medium">Current Price</th>
                      <th className="text-right px-6 py-3 text-gray-400 text-sm font-medium">Market Value</th>
                      <th className="text-right px-6 py-3 text-gray-400 text-sm font-medium">Gain/Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((entry) => {
                      const totalValue = entry.currentValue || entry.shares * (entry.averageCost || 0)
                      const totalCost = entry.totalCost || entry.shares * entry.averageCost
                      const gainLoss = entry.gainLoss !== undefined ? entry.gainLoss : totalValue - totalCost
                      const gainLossPercent = entry.gainLossPercent !== undefined 
                        ? entry.gainLossPercent 
                        : totalCost > 0 ? (gainLoss / totalCost) * 100 : 0

                      return (
                        <tr
                          key={entry.symbol}
                          className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/stocks/${entry.symbol}`)}
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-white">{entry.symbol}</div>
                          </td>
                          <td className="px-6 py-4 text-right text-white">{entry.shares}</td>
                          <td className="px-6 py-4 text-right text-gray-300">
                            ${entry.averageCost.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right text-white">
                            ${entry.currentPrice?.toFixed(2) || entry.averageCost.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right text-white font-semibold">
                            ${totalValue.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className={`font-semibold ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {gainLoss >= 0 ? '+' : ''}
                              ${gainLoss.toFixed(2)} ({gainLossPercent >= 0 ? '+' : ''}
                              {gainLossPercent.toFixed(2)}%)
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {/* Stocks Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Market</h3>
          {stocksLoading ? (
            <div className="text-center py-8 text-gray-400">
              <p>Loading stocks...</p>
            </div>
          ) : stocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stocks.map((stock) => (
                <Link
                  key={stock.symbol}
                  href={`/stocks/${stock.symbol}`}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-all cursor-pointer block"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-lg">{stock.symbol}</div>
                      <div className="text-sm text-gray-400 truncate">{stock.name}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-xl font-bold mb-1">
                      ${stock.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {stock.change >= 0 ? '+' : ''}
                      {stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%)
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No stocks available</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

