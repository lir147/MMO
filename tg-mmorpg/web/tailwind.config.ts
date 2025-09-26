
import type { Config } from 'tailwindcss'
export default {
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['InterVariable','system-ui','ui-sans-serif','Segoe UI','Roboto','Arial'] },
      colors: {
        bg: '#0b0f1a', panel: '#0f1523', accent: '#6ee7ff',
        gold: '#f5c84b', shard: '#86fffb', success: '#22c55e', danger: '#ef4444'
      },
      boxShadow: { soft: '0 10px 30px rgba(0,0,0,.35)' }
    }
  },
  plugins: []
} satisfies Config
