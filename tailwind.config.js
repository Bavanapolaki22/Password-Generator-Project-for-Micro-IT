module.exports = {
  content: [
    './index.html',
    './**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          750: '#2d3748',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};