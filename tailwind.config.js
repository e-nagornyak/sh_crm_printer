/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
    function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "flexible-text": (value) => ({
            fontSize: `clamp(${value}/1.4,5vw,${value})`,
          }),
        },
        { values: theme("width", {}) }
      )
    },
    function ({ addUtilities }) {
      const newUtilities = {
        ".c-text-shadow-sm": {
          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
        },
        ".c-text-shadow": {
          textShadow: "2px 2px 3px rgba(0, 0, 0, 0.5)",
        },
        ".c-text-shadow-md": {
          textShadow: "3px 3px 6px rgba(0, 0, 0, 0.6)",
        },
        ".c-text-shadow-lg": {
          textShadow: "4px 4px 10px rgba(0, 0, 0, 0.8)",
        },
      }
      addUtilities(newUtilities, ["responsive", "hover"])
    },
  ],
}
