/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dashboard-dark': '#1e2130',
        'dashboard-panel': '#282c3e',
        'dashboard-purple': '#7e57c2',
        'dashboard-blue': '#4e7fff',
        'dashboard-light-purple': '#b39ddb',
        'dashboard-text': '#e0e0e0',
        'dashboard-header': '#ffffff',
        'dashboard-subtext': '#9e9e9e',
      },
    },
  },
  plugins: [],
}
