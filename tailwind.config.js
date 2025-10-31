module.exports = {
  content: [
    "./index.html",
    "./renderer.js",
    "./components/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'glass-bg': 'rgba(255, 255, 255, 0.05)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        'accent-cyan': '#00d9ff',
        'accent-purple': '#a855f7',
        'accent-pink': '#ec4899',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'gradient-shift': 'gradientShift 20s ease infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(5%, 5%)' },
        },
      },
    },
  },
  plugins: [],
}
