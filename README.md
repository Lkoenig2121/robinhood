# Robinhood Trading Platform - Clone

A recreation of the Robinhood trading platform login screen built with Next.js, TypeScript, Tailwind CSS, Node.js, and Express.

## Features

- 🎨 Authentic Robinhood login page design
- 🔐 Login authentication with dummy accounts
- 📱 Responsive design
- ⚡ Built with Next.js 14 and TypeScript
- 🎯 Tailwind CSS for styling

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Express server also available)
- **Styling**: Tailwind CSS

## Getting Started

### Installation

```bash
npm install
```

### Development

#### Run Frontend and Backend Concurrently (Recommended)

Run both the Next.js frontend and Express backend servers at the same time:

```bash
npm run dev:all
```

This will start:

- **Frontend (Next.js)**: [http://localhost:3000](http://localhost:3000)
- **Backend (Express)**: [http://localhost:3001](http://localhost:3001)

The output will be color-coded for easy identification of each service.

#### Run Frontend Only

Run just the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the login page.

#### Run Backend Only

Run just the Express server:

```bash
npm run server
```

The Express server will run on [http://localhost:3001](http://localhost:3001).

## Dummy Account Information

Use any of these accounts to log in:

### Account 1

- **Email**: `demo@robinhood.com`
- **Password**: `demo123`
- **Name**: John Doe
- **Balance**: $12,500.75

### Account 2

- **Email**: `test@example.com`
- **Password**: `test123`
- **Name**: Jane Smith
- **Balance**: $8,743.20

### Account 3

- **Email**: `trader@demo.com`
- **Password**: `trader123`
- **Name**: Alex Johnson
- **Balance**: $45,678.90

## Project Structure

```
robinhood/
├── app/                  # Next.js app directory
│   ├── api/             # API routes
│   ├── login/           # Login page
│   └── globals.css      # Global styles
├── components/          # React components
│   └── LoginForm.tsx    # Login form component
├── server/              # Express server (optional)
│   ├── index.ts/js      # Express server setup
│   └── dummyAccounts.ts/js  # Dummy account data
└── package.json         # Dependencies
```

## Features Implemented

- ✅ Login page with email and password fields
- ✅ Password visibility toggle
- ✅ "Keep me logged in" checkbox (30-day session)
- ✅ Help button
- ✅ Passkey login button (UI only)
- ✅ Create account link
- ✅ Error handling and validation
- ✅ Dummy account authentication
- ✅ Cookie-based session management

## Next Steps

- [ ] Dashboard/home page after login
- [ ] Portfolio view
- [ ] Stock search and trading interface
- [ ] Account settings
- [ ] Real-time stock data integration
