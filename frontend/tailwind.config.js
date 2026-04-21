/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          100: "#ebe0fcff",
          200: "#84639fff",
          300: "#704792ff",
          400: "#4f2471ff",
          500: "#571f85ff",
          600: "#4a1c6fff",
          700: "#371a4fff",
          800: "#371a4fff",
          900: "#371a4fff",
        },
        "cyber-neon": "#22d3ee",
        "cyber-purple": "#8b5cf6",
      },
    }
  },
  plugins: [],
};
