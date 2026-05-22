import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        deepBlue: '#0a1628',
        cyan: '#00d4ff',
        neonBlue: '#2d87ff',
      },
    },
  },
  plugins: [],
}

export default config
