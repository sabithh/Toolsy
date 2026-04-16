import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Vaadaka Dark Theme
                primary: {
                    DEFAULT: '#D20000',
                    light: '#FF3333',
                    dark: '#B10000',
                },
                secondary: {
                    DEFAULT: '#111111',
                    light: '#1A1A1A',
                },
                accent: {
                    DEFAULT: '#F0F0F0',
                    dark: '#555555',
                },
                background: '#0A0A0A',
                surface: '#111111',
                border: '#1E1E1E',
            },
            fontFamily: {
                sans: ['var(--font-barlow)', 'system-ui', 'sans-serif'],
                bebas: ['var(--font-bebas)', 'sans-serif'],
                barlow: ['var(--font-barlow)', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'gradient': 'gradient 8s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                gradient: {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center'
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center'
                    },
                },
            },
        },
    },
    plugins: [],
};

export default config;
