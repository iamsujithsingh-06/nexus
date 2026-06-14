/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: '#000000',
          surface: '#050816',
          card: '#0F172A',
          'card-hover': '#131D35',
          border: 'rgba(255,255,255,0.08)',
          'border-light': 'rgba(255,255,255,0.04)',
          'border-hover': 'rgba(255,255,255,0.14)',
          text: '#FFFFFF',
          subtle: '#94A3B8',
          muted: '#475569',
          accent: '#60A5FA',
          'accent-glow': 'rgba(96, 165, 250, 0.12)',
          'accent-subtle': 'rgba(96, 165, 250, 0.06)',
          'accent-border': 'rgba(96, 165, 250, 0.2)',
          code: '#0A0E1A',
          'code-border': 'rgba(255,255,255,0.06)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
        xs: '0.75rem',
        sm: '0.8125rem',
        base: '0.9375rem',
        lg: '1.0625rem',
        xl: '1.25rem',
        '2xl': '1.75rem',
        '3xl': '2.25rem',
        '4xl': '3rem',
        '5xl': '4rem',
        '6xl': '5rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        'sidebar': '56px',
        'sidebar-expanded': '200px',
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        DEFAULT: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.6)',
        'glass-lg': '0 16px 48px rgba(0,0,0,0.7)',
        'accent': '0 0 30px rgba(96,165,250,0.08)',
        'accent-lg': '0 0 60px rgba(96,165,250,0.15)',
        'card': '0 2px 20px rgba(0,0,0,0.4)',
        'elevated': '0 4px 24px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-down': 'fadeInDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-left': 'slideLeft 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-accent': 'pulseAccent 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'grid-scroll': 'gridScroll 20s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseAccent: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(96,165,250,0.05)' },
          '50%': { boxShadow: '0 0 40px rgba(96,165,250,0.15)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        gridScroll: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(24px)' },
        },
      },
    },
  },
  plugins: [],
};
