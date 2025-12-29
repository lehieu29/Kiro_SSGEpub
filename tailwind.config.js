/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.njk',
    './src/**/*.html',
    './src/**/*.md',
    './src/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        // Light mode colors
        light: {
          bg: '#ffffff',
          text: '#1f2937',
          card: '#f9fafb',
          border: '#e5e7eb',
          primary: '#3b82f6',
          secondary: '#6b7280'
        },
        // Dark mode colors
        dark: {
          bg: '#111827',
          text: '#f9fafb',
          card: '#1f2937',
          border: '#374151',
          primary: '#60a5fa',
          secondary: '#9ca3af'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
