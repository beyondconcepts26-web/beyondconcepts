import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1A1040',
          darker: '#0F0A2A',
          mid: '#130C35',
          amber: '#D97706',
          orange: '#EA580C',
          cream: '#FAF9F6',
        },
      },
    },
  },
  plugins: [],
}

export default config
