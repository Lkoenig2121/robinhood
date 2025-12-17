'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import RobinhoodLogo from '@/components/RobinhoodLogo'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [keepLoggedIn, setKeepLoggedIn] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTestAccounts, setShowTestAccounts] = useState(true)

  const testAccounts = [
    {
      email: 'demo@robinhood.com',
      password: 'demo123',
      name: 'John Doe',
      balance: '$12,500.75'
    },
    {
      email: 'test@example.com',
      password: 'test123',
      name: 'Jane Smith',
      balance: '$8,743.20'
    },
    {
      email: 'trader@demo.com',
      password: 'trader123',
      name: 'Alex Johnson',
      balance: '$45,678.90'
    }
  ]

  const fillCredentials = (accountEmail: string, accountPassword: string) => {
    setEmail(accountEmail)
    setPassword(accountPassword)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, keepLoggedIn }),
      })

      const data = await response.json()

      if (response.ok) {
        // Success - redirect to dashboard
        router.push('/dashboard')
      } else {
        setError(data.message || 'Invalid email or password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-12">
        <div className="flex justify-center mb-6">
          <RobinhoodLogo className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-semibold text-black text-center">
          Log in to Robinhood
        </h1>
      </div>

      {/* Test Accounts Info */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowTestAccounts(!showTestAccounts)}
          className="w-full flex items-center justify-between bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-left hover:bg-gray-200 transition-all"
        >
          <span className="text-black text-sm font-medium">
            Demo Accounts (Click to {showTestAccounts ? 'hide' : 'show'})
          </span>
          <svg
            className={`w-5 h-5 text-black transition-transform ${showTestAccounts ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {showTestAccounts && (
          <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            {testAccounts.map((account, index) => (
              <div
                key={index}
                className="bg-white border border-gray-300 rounded-lg p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-black font-medium text-sm">{account.name}</p>
                    <p className="text-gray-600 text-xs">Balance: {account.balance}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillCredentials(account.email, account.password)}
                    className="text-xs bg-robinhood-green text-black px-3 py-1 rounded hover:bg-robinhood-green-dark transition-all font-medium"
                  >
                    Fill
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 w-16">Email:</span>
                    <span className="text-black font-mono">{account.email}</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(account.email)}
                      className="text-gray-600 hover:text-black ml-auto"
                      title="Copy email"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 w-16">Password:</span>
                    <span className="text-black font-mono">{account.password}</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(account.password)}
                      className="text-gray-600 hover:text-black ml-auto"
                      title="Copy password"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-black text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-robinhood-green focus:border-transparent transition-all"
            placeholder="Email"
          />
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-black text-sm font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-robinhood-green focus:border-transparent transition-all pr-12"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showPassword ? (
                  <>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </>
                ) : (
                  <>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Keep me logged in checkbox */}
        <div className="flex items-center">
          <input
            id="keepLoggedIn"
            type="checkbox"
            checked={keepLoggedIn}
            onChange={(e) => setKeepLoggedIn(e.target.checked)}
            className="focus:ring-2 focus:ring-robinhood-green focus:ring-offset-0 focus:ring-offset-white"
          />
          <label htmlFor="keepLoggedIn" className="ml-3 text-black text-sm cursor-pointer">
            Keep me logged in for up to 30 days
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-robinhood-green text-black font-medium py-3 px-6 rounded-lg hover:bg-robinhood-green-dark focus:outline-none focus:ring-2 focus:ring-robinhood-green focus:ring-offset-2 focus:ring-offset-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
          <button
            type="button"
            className="bg-transparent border border-gray-300 text-black font-medium py-3 px-6 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-white transition-all"
          >
            Help
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-600 text-sm">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Passkey Button */}
        <button
          type="button"
          className="w-full bg-transparent border border-gray-300 text-black font-medium py-3 px-6 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-white transition-all flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Log in with passkeys
        </button>

        {/* Create Account Link */}
        <div className="text-center pt-4">
          <p className="text-black text-sm">
            Not on Robinhood?{' '}
            <a
              href="#"
              className="underline hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-robinhood-green rounded text-robinhood-green"
            >
              Create an account
            </a>
          </p>
        </div>

        {/* Footer Notice */}
        <div className="text-center pt-8 pb-4">
          <p className="text-gray-500 text-xs">
            This site is protected by reCAPTCHA and the Google{' '}
            <a href="#" className="underline hover:text-gray-400">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-gray-400">
              Terms of Service
            </a>{' '}
            apply.
          </p>
        </div>
      </form>
    </div>
  )
}

