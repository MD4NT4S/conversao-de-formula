/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#137fec',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
