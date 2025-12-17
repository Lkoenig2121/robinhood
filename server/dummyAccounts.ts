export interface User {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  balance: number
}

export interface PortfolioEntry {
  symbol: string
  shares: number
  averageCost: number
}

export const dummyAccounts: User[] = [
  {
    id: 'user1',
    email: 'demo@robinhood.com',
    password: 'demo123',
    firstName: 'John',
    lastName: 'Doe',
    balance: 12500.75
  },
  {
    id: 'user2',
    email: 'test@example.com',
    password: 'test123',
    firstName: 'Jane',
    lastName: 'Smith',
    balance: 8743.20
  },
  {
    id: 'user3',
    email: 'trader@demo.com',
    password: 'trader123',
    firstName: 'Alex',
    lastName: 'Johnson',
    balance: 45678.90
  }
]

