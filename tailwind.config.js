/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        emerald: {
          400: '#7BC6A4',
          500: '#6BB594',
        },
        stone: {
          50: '#EFE9DD',
        },
      },
    },
  },
  plugins: [],
};
