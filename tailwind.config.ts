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
        orange: {
          DEFAULT: '#E65C00',
          light: '#FF7B2E',
          pale: '#FFF1E8',
          50: '#FFF8F3',
          100: '#FFF1E8',
          200: '#FFD6B0',
          400: '#FF7B2E',
          500: '#E65C00',
          600: '#CC5200',
          700: '#A34100',
        },
        navy: {
          DEFAULT: '#1A2B4A',
          mid: '#2D4270',
          light: '#EEF2FA',
          50: '#F5F7FC',
          100: '#EEF2FA',
          200: '#C7D4EE',
          400: '#6B85B8',
          600: '#2D4270',
          700: '#1A2B4A',
          800: '#12203A',
          900: '#0D1828',
        },
        brand: {
          blue: '#1A56DB',
          orange: '#E65C00',
        },
        warm: '#FAFAF9',
      },
      fontFamily: {
        head: ['var(--font-sora)', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
        tamil: ['var(--font-noto-tamil)', 'sans-serif'],
      },
      backgroundImage: {
        'grid-white': `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
      },
      backgroundSize: {
        'grid': '60px 60px',
      },
      animation: {
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'count-up': 'countUp 0.3s ease-out forwards',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
