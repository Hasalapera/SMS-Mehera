/** @type {import('tailwindcss').Config} */
export default {
  // 🛡️ මේ පේළිය අනිවාර්යයෙන්ම දාන්න. එතකොට තමයි 'dark' class එක class list එකේ තිබුණොත් ඩාර්ක් වෙන්නේ.
  darkMode: 'class', 
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // මෙතනට උඹේ සිස්ටම් එකේ brand colors දාගන්න පුළුවන් (Optional)
      colors: {
        primary: '#b4a460',
        darkBg: '#141414',
        darkCard: '#1A1A1A'
      }
    },
  },
  plugins: [],
}