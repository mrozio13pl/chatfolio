import animate from 'tailwindcss-animate';
import type { Config } from 'tailwindcss';

export default {
    darkMode: ['class'],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,md,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,md,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,md,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--primary)',
                secondary: 'var(--secondary)',
                'base-100': 'var(--base-100)',
                'base-200': 'var(--base-200)',
                'base-300': 'var(--base-300)',
                'content-100': 'var(--content-100)',
                'content-200': 'var(--content-200)',
                'content-300': 'var(--content-300)',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
            },
        },
    },
    plugins: [animate],
} satisfies Config;
