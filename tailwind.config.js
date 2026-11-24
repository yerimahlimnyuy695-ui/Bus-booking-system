/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: { colors: { brand: { 50: '#fffbea', 500: '#eab308', 600: '#ca8a04', 700: '#a16207' } } } },
  plugins: []
};
