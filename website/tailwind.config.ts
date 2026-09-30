import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        circolatorio: '#C0392B',
        digerente: '#27AE60',
        immunitario: '#1A3A5C',
        nervoso: '#1C1C1C',
        base: '#0D0D0D',
      },
    },
  },
  plugins: [],
} satisfies Config
