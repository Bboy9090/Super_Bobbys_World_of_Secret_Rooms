/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warp-green': '#00D800',
        'warp-dark': '#008800',
        'block-brown': '#B85418',
        'coin-gold': '#FFC700',
        'power-star': '#FFE66D',
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive', 'monospace'],
      },
    },
  },
  plugins: [],
}
