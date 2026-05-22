/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#16212f',
        ocean: '#0f766e',
        ember: '#d97706'
      }
    }
  },
  plugins: []
};
