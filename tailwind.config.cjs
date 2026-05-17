const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', 'Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono Variable', 'JetBrains Mono', ...defaultTheme.fontFamily.mono],
        display: ['Inter Variable', 'Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        ink: {
          50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1',
          400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155',
          800: '#1E293B', 900: '#0F172A', 950: '#020617',
        },
        accent: {
          50: '#F5F3FF', 100: '#EDE9FE', 200: '#DDD6FE', 300: '#C4B5FD',
          400: '#A78BFA', 500: '#8B5CF6', 600: '#7C3AED', 700: '#5B21B6',
          800: '#4C1D95', 900: '#2E1065', 950: '#1B0644',
        },
        ok: { DEFAULT: '#059669', 50: '#ECFDF5', 600: '#059669', 700: '#047857' },
        warn: { DEFAULT: '#D97706', 50: '#FFFBEB', 600: '#D97706', 700: '#B45309' },
        risk: { DEFAULT: '#DC2626', 50: '#FEF2F2', 600: '#DC2626', 700: '#B91C1C' },
        info: { DEFAULT: '#2563EB', 50: '#EFF6FF', 600: '#2563EB', 700: '#1D4ED8' },
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
      },
      maxWidth: { 'prose-wide': '72ch', content: '80rem', narrow: '40rem' },
      boxShadow: {
        card: '0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.04)',
        lift: '0 4px 6px -1px rgb(15 23 42 / 0.06), 0 2px 4px -2px rgb(15 23 42 / 0.04)',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.ink.700'),
            '--tw-prose-headings': theme('colors.ink.900'),
            '--tw-prose-links': theme('colors.accent.700'),
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')({ strategy: 'class' })],
};
