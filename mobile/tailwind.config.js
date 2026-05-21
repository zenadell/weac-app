/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Ultra-Premium Dark Theme Tokens
        canvas: "#121214", // Deep rich dark background
        ink: "#FFFFFF",    // Pure white text
        card: "#1C1C24",   // Slightly lighter card background
        foreground: "#FFFFFF",
        muted: "#2C2C35",
        "muted-foreground": "#8E8E9F",
        border: "#2C2C35",
        
        // Highly Saturated Accent Colors (from Image 3)
        primary: "#FA675E", // Vibrant Red/Coral
        purple: "#4C3297",
        green: "#30C5A0",
        yellow: "#FFB63B",
        peach: "#FF9E80",
        lilac: "#CE93D8",
        butter: "#FFF176",
        sky: "#90CAF9",
        rose: "#EF5350",
      },
      fontFamily: {
        sans: ["Outfit_400Regular", "System"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "40px",
      },
    },
  },
  plugins: [],
};
