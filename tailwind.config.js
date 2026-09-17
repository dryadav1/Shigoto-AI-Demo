/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 50:"#f7f8fa",100:"#eef1f5",200:"#dfe5ec",300:"#c3ccd7",400:"#9aa7b9",500:"#6b7a90",600:"#4d5a6f",700:"#3a4454",800:"#232b38",900:"#141a24" },
        brand: { 50:"#eef4ff",100:"#dbe7fe",200:"#bfd3fe",300:"#93b4fd",400:"#608dfa",500:"#3b67f6",600:"#2549eb",700:"#1e38d8",800:"#1e32af",900:"#1e2f89" },
        accent: { 50:"#fef6ee",100:"#fdebd7",200:"#fad4ae",300:"#f6b578",400:"#f1843f",500:"#ee5f1c",600:"#df4712",700:"#b93412",800:"#932d16",900:"#762815" }
      },
      fontFamily: {
        sans: ["'Noto Sans JP'","'Inter'","system-ui","sans-serif"],
      },
      boxShadow: { card: "0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.08)", pop: "0 12px 32px rgba(16,24,40,.14)" }
    },
  },
  plugins: [],
};
