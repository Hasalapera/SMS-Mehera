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
        border: 'var(--color-border)',
      },
      boxShadow: {
        // ✨ Luxury soft shadows
        'sm': '0 4px 20px -2px rgba(0, 0, 0, 0.03)',
        'md': '0 10px 40px -4px rgba(0, 0, 0, 0.05)',
        'lg': '0 15px 50px -5px rgba(0, 0, 0, 0.08)',
        'xl': '0 25px 70px -10px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}