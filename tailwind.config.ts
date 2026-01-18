import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Accessible color palette with sufficient contrast
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // High contrast text colors
        accessible: {
          text: '#1f2937',       // Dark gray for body text
          heading: '#111827',    // Near black for headings
          muted: '#4b5563',      // Gray for secondary text
          link: '#1d4ed8',       // Blue for links (AA compliant)
          linkHover: '#1e40af',  // Darker blue for hover
        }
      },
      // Focus ring for keyboard navigation
      ringWidth: {
        'focus': '3px',
      },
    },
  },
  plugins: [],
}
export default config
