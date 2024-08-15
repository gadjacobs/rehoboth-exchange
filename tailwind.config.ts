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
        primary: '#4F46E5',
        secondary: '#64748B',
        accent: '#10B981',
        background: '#F9FAFB',
        card: '#FFFFFF',
        border: '#E5E7EB',
        error: '#EF4444',
      },
    },
  },
  plugins: [],
};
export default config;
