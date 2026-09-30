import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        plasma: 'var(--plasma)',
        arteria: 'var(--arteria)',
        brace: 'var(--brace)',
        osso: 'var(--osso)',
        'osso-2': 'var(--osso-2)',
        sys: {
          light: 'var(--sys-light)',
          dark: 'var(--sys-dark)',
          bg: 'var(--sys-bg)',
        },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'Georgia', 'serif'],
        nunito: ['Nunito', 'system-ui', 'sans-serif'],
        anton: ['Anton', 'Impact', 'sans-serif'],
        script: ['"Mr Dafoe"', 'cursive'],
      },
    },
  },
  plugins: [],
} satisfies Config
