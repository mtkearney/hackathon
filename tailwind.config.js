/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#212D54',    // Deep navy blue
        secondary: '#FDF4C9',  // Light cream/yellow
        accent: '#DC481F',     // Vibrant orange-red
        background: '#ffffff', // White
        foreground: '#22231B', // Dark gray/almost black
      },
      fontFamily: {
        sans: ['Instrument Sans', 'sans-serif'],
        title: ['Boldonse', 'serif'],
      },
    },
  },
  plugins: [],
}; 