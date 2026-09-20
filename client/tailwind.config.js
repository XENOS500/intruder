/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FFFDF5', // Canonical Neubrutalism warm off-white
        brutal: {
          black: '#000000',
          white: '#FFFFFF',
          offwhite: '#FFFDF5',
          // Canonical Neubrutalism saturated accents
          yellow: '#FFD23F',
          pink: '#FF6B6B',
          red: '#FF5252',
          blue: '#74B9FF',
          green: '#88D498',
          orange: '#FFA552',
          purple: '#B8A9FA',
          // Canonical pastel surfaces / box fills
          'yellow-light': '#FFF9E6',
          'pink-light': '#FFEBEB',
          'blue-light': '#E8F4FD',
          'green-light': '#EAF8EE',
          'orange-light': '#FFF3E8',
          'purple-light': '#F2EFFF',
          'gray-light': '#F4F4F0',
        },
      },
      boxShadow: {
        'brutal-sm': '3px 3px 0 #000000',
        'brutal': '5px 5px 0 #000000',
        'brutal-lg': '8px 8px 0 #000000',
        'brutal-xl': '12px 12px 0 #000000',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Space Mono', 'monospace'],
        display: ['Space Grotesk', 'Syne', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
