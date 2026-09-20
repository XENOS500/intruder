/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FDFBF7',
        brutal: {
          yellow: '#FFEB3B',
          red: '#FF5252',
          blue: '#2196F3',
          green: '#4CAF50',
          orange: '#FF9800',
          black: '#000000',
          white: '#FFFFFF',
          cream: '#FDFBF7',
          pink: '#FFEBEE',
          dark: '#121212',
          gray: '#E0E0E0',
        },
      },
      boxShadow: {
        'brutal-sm': '2px 2px 0 #000000',
        'brutal': '4px 4px 0 #000000',
        'brutal-lg': '6px 6px 0 #000000',
        'brutal-xl': '8px 8px 0 #000000',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
