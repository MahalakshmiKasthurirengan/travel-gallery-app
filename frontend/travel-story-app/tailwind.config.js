/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily:{
      fontFamily: ["Fredoka, sans-serif"],
    },
    extend: {
      colors: {
        primary: "#ec4899",
        secondary: "#FADADD"
      },
      backgroundImage: {
        'login-bgimg': "url('./src/assets/images/bg1.jpg')",
        'signUp-bgimg': "url('./src/assets/images/bg2.jpg')",
      }
    },
  },
  plugins: [],
}