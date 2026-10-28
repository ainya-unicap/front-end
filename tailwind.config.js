/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#0B4A2F',     // Verde escuro (Fundo da Splash Screen e botões)
        secondary: '#E6F4EC',   // Verde claro
        background: '#F3F5F2',  // Cor de fundo geral do app
        accent: '#BF6A02',      // Laranja/Dourado (Arco da logo e barra de carregamento)
      }
    },
  },
  plugins: [],
}