/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      colors: {
        'apple-blue': '#007AFF',
        'apple-red': '#FF3B30',
        'apple-green': '#34C759',
        'apple-gray': '#8E8E93',
        'apple-dark': '#1C1C1E',
        'apple-orange': '#FF9500',
        'apple-yellow': '#FFCC00',
        'apple-purple': '#AF52DE',
        'apple-pink': '#FF2D55',
        'apple-teal': '#5AC8FA',
        'apple-indigo': '#5856D6',
        
        // Nuances subtiles pour les fonds
        'soft-blue': '#F0F7FF',
        'soft-green': '#F0FFF4',
        'soft-purple': '#F5F0FF',
        'soft-pink': '#FFF0F5',
        'soft-yellow': '#FFFBEB',
        'soft-teal': '#F0FFFF',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
      },
      boxShadow: {
        'ios': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'ios-dark': '0 4px 20px rgba(0, 0, 0, 0.2)',
        'inner-white': 'inset 0 1px 1px rgba(255, 255, 255, 0.5)',
        'inner-dark': 'inset 0 1px 1px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'gradient-blue': 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)',
        'gradient-green': 'linear-gradient(135deg, #34C759 0%, #5AC8FA 100%)',
        'gradient-red': 'linear-gradient(135deg, #FF3B30 0%, #FF9500 100%)',
        'gradient-purple': 'linear-gradient(135deg, #AF52DE 0%, #5856D6 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FF2D55 0%, #FF9500 100%)',
        'gradient-night': 'linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
  darkMode: 'media', // basé sur préférence système iOS
} 