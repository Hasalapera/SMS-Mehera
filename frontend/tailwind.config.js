/** @type {import('tailwindcss').Config} */
export default {
  // 🛡️ 'class' mode එක පාවිච්චි කරන්නේ <html> tag එකට අපි දාන class එක අනුව theme එක මාරු කරන්න
  darkMode: 'class', 
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🎨 දැන් මේවා CSS Variables වලට link කරලා තියෙන්නේ
        primary: 'var(--color-primary)',
        background: 'var(--color-bg)',
        card: 'var(--color-card)',
        textMain: 'var(--color-text)',
        sidebar: 'var(--color-sidebar)',
      }
    },
  },
  plugins: [],
}