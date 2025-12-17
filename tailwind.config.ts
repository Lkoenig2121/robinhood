import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        robinhood: {
          green: '#00C805',
          'green-dark': '#00A804',
          'green-light': '#00E806',
          'green-bg': '#00C805',
        },
      },
    },
  },
  plugins: [],
}
export default config

