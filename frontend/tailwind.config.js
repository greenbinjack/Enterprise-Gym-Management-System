/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enables dark mode toggling via the 'dark' class on <html>
    theme: {
        extend: {
            colors: {
                cream: '#ECE7D1',
                lightSage: '#DBCEA5',
                olive: '#8E977D',
                brown: '#8A7650',
                // Adding a deep dark background color for dark mode that fits the earthy theme
                darkBg: '#1C1C1A',
                darkCard: '#2A2A28',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'], // Professional, clean font
            }
        },
    },
    plugins: [],
}