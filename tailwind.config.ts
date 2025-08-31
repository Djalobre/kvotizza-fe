import type { Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Custom colors for Kvotizza theme, based on logo
        'kvotizza-dark-bg': {
          10: '#1d2631',
          20: '#2C3A4B',
          30: '#2b3b5c',

        },
        'kvotizza-dark-theme-red': {
          10: '#fc9088',
        },
        'kvotizza-dark-theme-purple': {
          10: '#e8d8eb',
          20: '#8b4cd9',
        },
        'kvotizza-dark-theme-green': {
          10: '#b0f5dc',
        },
        'kvotizza-dark-theme-blue': {
          10: '#c2caf2',
          20: '#2c3e50',
        },
        'kvotizza-green': {
          10: '#17865d',
          20: '#147955',
          50: '#d2eee3',
          100: '#c8e6c9',
          200: '#6fbf8e',
          300: '#81c784',
          400: '#66bb6a',
          500: '#137955', // Logo Green
          600: '#1C9267',
          700: '#137955',
          800: '#2E7D32',
          900: '#1B5E20',
          950: '#0F3B12',
        },
        'kvotizza-headline': {
          700: '#137955',
        },

        // : "bg-transparent text-kvotizza-blue-700 hover:bg-kvotizza-blue-50 border-kvotizza-blue-200"

        'kvotizza-blue': {
          50: '#e8ebfc',
          100: '#bbdefb',
          200: '#8fa6ea',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#5569D6', // A clear, dynamic blue
          600: '#4459C0',
          700: '#5569D6',
          800: '#1565C0',
          900: '#0D47A1',
          950: '#082D64',
        },
        'kvotizza-yellow': {
          10: '#F2994A',
          50: '#fffde7',
          100: '#fff9c4',
          200: '#fff59d',
          300: '#fff176',
          400: '#ffee58',
          500: '#FFEB3B', // An energetic yellow
          600: '#FDD835',
          700: '#FBC02D',
          800: '#F9A825',
          900: '#F57F17',
          950: '#934C0E',
        },
        'kvotizza-red': {
          50: '#ffebee',
          100: '#ffcdd2',
          200: '#ef9a9a',
          300: '#e57373',
          400: '#ef5350',
          500: '#F44336', // A strong, clear red
          600: '#E53935',
          700: '#D32F2F',
          800: '#C62828',
          900: '#B71C1C',
          950: '#701111',
        },
        'kvotizza-purple': {
          50: '#f3e5f5',
          100: '#e1bee7',
          200: '#ce93d8',
          300: '#ba68c8',
          400: '#ab47bc',
          500: '#9C27B0', // A vibrant purple
          600: '#8E24AA',
          700: '#7B1FA2',
          800: '#6A1B9A',
          900: '#4A148C',
          950: '#2E0D57',
        },
        'sport-green': {
          50: '#e6ffe6',
          100: '#ccffcc',
          200: '#99ff99',
          300: '#66ff66',
          400: '#33ff33',
          500: '#2d8f5f', // Primary green from your logo
          600: '#2d8f5f', // Primary green from your logo
          700: '#009900',
          800: '#006600',
          900: '#003300',
          950: '#001a00',
        },
        'sport-blue': {
          50: '#e6f0ff',
          100: '#cce0ff',
          200: '#99c2ff',
          300: '#66a3ff',
          400: '#3385ff',
          500: '#0c8ce9', // Professional blue
          600: '#0052cc',
          700: '#003d99',
          800: '#002966',
          900: '#001433',
          950: '#000a1a',
        },
        'sport-yellow': {
          50: '#fffbe6',
          100: '#fff7cc',
          200: '#ffeb99',
          300: '#ffdf66',
          400: '#ffd333',
          500: '#eab308', // Warm gold instead of bright yellow
          600: '#cc9e00',
          700: '#997700',
          800: '#665000',
          900: '#332800',
          950: '#1a1400',
        },
        'sport-red': {
          50: '#ffe6e6',
          100: '#ffcccc',
          200: '#ff9999',
          300: '#ff6666',
          400: '#ff3333',
          500: '#ff0000',
          600: '#cc0000',
          700: '#990000',
          800: '#660000',
          900: '#330000',
          950: '#1a0000',
        },
        'sport-purple': {
          50: '#f0e6ff',
          100: '#e0ccff',
          200: '#c299ff',
          300: '#a366ff',
          400: '#8533ff',
          500: '#6600ff',
          600: '#5200cc',
          700: '#3d0099',
          800: '#290066',
          900: '#140033',
          950: '#0a001a',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
