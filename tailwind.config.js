/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'brand': {
                    'blue': '#3d6494',
                    'blue-dark': '#2d4a6e',
                    'blue-light': '#5a82b4',
                    'blue-lighter': '#8aaac8',
                    'blue-lightest': '#c8daea',
                    'orange': '#d4845a',
                    'orange-dark': '#bc6e46',
                    'orange-vivid': '#e8621a',
                    'orange-light': '#e0a07a',
                    'orange-lighter': '#ecc4a8',
                    'muted': '#7a8fa6',
                    'muted-light': '#a0b4c4',
                    'muted-dark': '#2c3a4a'
                },
                'night': {
                    'bg': '#1a2332',
                    'card': '#243044',
                    'card-inner': '#2c3a52',
                    'border': '#334466',
                }
            },
            fontFamily: {
                'sans': ['Inter', 'system-ui', 'sans-serif']
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out'
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                }
            }
        },
    },
    plugins: [],
}