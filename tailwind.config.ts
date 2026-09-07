import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#122C57',
          deep: '#0A1B3D',
        },
        gold: {
          DEFAULT: '#C99A44',
          bright: '#E2B14E',
        },
        bg: {
          DEFAULT: '#FFFFFF',
          warm: '#F7F5F0',
        },
        space: {
          black: '#0A0A0D',
        },
        slate: {
          DEFAULT: '#6B7280',
          line: '#E4E2DC',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      letterSpacing: {
        wordmark: '0.25em',
      },
      spacing: {
        'section-desktop': '160px',
        'section-mobile': '80px',
      },
      maxWidth: {
        'prose-editorial': '640px',
        'container': '1240px',
      },
      animation: {
        'orbit-slow': 'spin 40s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
