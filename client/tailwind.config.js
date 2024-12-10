/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        'white-10': 'rgba(255, 255, 255, 0.1)',
        'white-15': 'rgba(255, 255, 255, 0.15)',
      },
      colors: {
        'custom-blue': '#3a6bfc',
      },
    }
  },
  plugins: [],
}

