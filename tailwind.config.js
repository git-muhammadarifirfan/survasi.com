/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
        },
        accent: 'var(--color-accent)',
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
        },
        status: {
          belum: 'var(--status-belum)',
          sebagian: 'var(--status-sebagian)',
          sudah: 'var(--status-sudah)',
          netral: 'var(--status-netral)',
        }
      },
      borderRadius: {
        'card': '16px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(28,27,51,0.06)',
        'card-hover': '0 8px 30px rgba(28,27,51,0.12)',
        'soft': '0 2px 8px rgba(28,27,51,0.04)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out both',
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-up': 'slideUp 0.4s ease-out both',
        'scale-in': 'scaleIn 0.3s ease-out both',
      },
    },
  },
  plugins: [],
}
