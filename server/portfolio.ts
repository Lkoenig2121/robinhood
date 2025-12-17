// In-memory portfolio storage (in production, this would be a database)
interface PortfolioEntry {
  symbol: string
  shares: number
  averageCost: number
}

const portfolios: Map<string, PortfolioEntry[]> = new Map()

export function getPortfolio(userId: string): PortfolioEntry[] {
  return portfolios.get(userId) || []
}

export function addToPortfolio(
  userId: string,
  symbol: string,
  shares: number,
  price: number
): void {
  const portfolio = portfolios.get(userId) || []
  const existing = portfolio.find((entry) => entry.symbol === symbol)

  if (existing) {
    // Update average cost basis
    const totalCost = existing.averageCost * existing.shares + price * shares
    existing.shares += shares
    existing.averageCost = totalCost / existing.shares
  } else {
    portfolio.push({
      symbol,
      shares,
      averageCost: price,
    })
  }

  portfolios.set(userId, portfolio)
}

export function removeFromPortfolio(
  userId: string,
  symbol: string,
  shares: number
): boolean {
  const portfolio = portfolios.get(userId) || []
  const existing = portfolio.find((entry) => entry.symbol === symbol)

  if (!existing || existing.shares < shares) {
    return false
  }

  existing.shares -= shares

  if (existing.shares === 0) {
    const index = portfolio.indexOf(existing)
    portfolio.splice(index, 1)
  }

  portfolios.set(userId, portfolio)
  return true
}

export function getPortfolioEntry(
  userId: string,
  symbol: string
): PortfolioEntry | null {
  const portfolio = portfolios.get(userId) || []
  return portfolio.find((entry) => entry.symbol === symbol) || null
}

