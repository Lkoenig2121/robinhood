'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import RobinhoodLogo from '@/components/RobinhoodLogo'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  balance: number
}

interface PortfolioEntry {
  symbol: string
  shares: number
  averageCost: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication and fetch user data
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

    // Fetch portfolio
    fetch('/api/portfolio', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.portfolio) {
          setPortfolio(data.portfolio)
        }
      })
      .catch(console.error)
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-black text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <nav className="border-b-4 border-robinhood-green px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
            <RobinhoodLogo className="w-8 h-8" showText={true} />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              Dashboard
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

      <main className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/dashboard"
          className="text-gray-600 hover:text-black mb-6 inline-block transition-colors"
        >
          ← Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {/* Account Balance */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Account Balance</h2>
          <div className="text-4xl font-bold">
            ${user.balance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <p className="text-gray-600 text-sm mt-2">Available cash for trading</p>
        </div>

        {/* Profile Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-6">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-600 text-sm mb-1">First Name</label>
              <div className="text-black text-lg font-medium">{user.firstName}</div>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">Last Name</label>
              <div className="text-black text-lg font-medium">{user.lastName}</div>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">Email</label>
              <div className="text-black text-lg font-medium">{user.email}</div>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">Account ID</label>
              <div className="text-black text-lg font-medium font-mono text-sm">{user.id}</div>
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Portfolio Summary</h2>
          {portfolio.length > 0 ? (
            <div className="space-y-3">
              <div>
                <div className="text-gray-600 text-sm mb-1">Total Holdings</div>
                <div className="text-2xl font-bold text-black">{portfolio.length}</div>
              </div>
              <div>
                <div className="text-gray-600 text-sm mb-1">Total Stocks Owned</div>
                <div className="text-2xl font-bold text-black">
                  {portfolio.reduce((sum, entry) => sum + entry.shares, 0)}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="text-gray-600 text-sm mb-2">Holdings</div>
                <div className="space-y-2">
                  {portfolio.map((entry) => (
                    <div
                      key={entry.symbol}
                      className="flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      onClick={() => router.push(`/stocks/${entry.symbol}`)}
                    >
                      <div>
                        <div className="font-semibold text-black">{entry.symbol}</div>
                        <div className="text-sm text-gray-600">
                          {entry.shares} share(s) @ ${entry.averageCost.toFixed(2)} avg
                        </div>
                      </div>
                      <div className="text-black font-medium">
                        ${(entry.shares * entry.averageCost).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <p>No holdings yet</p>
              <Link
                href="/dashboard"
                className="text-black underline hover:text-gray-300 mt-2 inline-block"
              >
                Start trading
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

