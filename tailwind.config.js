/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.tsx'],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      boxShadow: {
        popover: '0 0 50px -15px rgba(0, 0, 0, 0.3)',
      },
      fontFamily: {
        sans: [
          'pp-neue-montreal-regular',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Open Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      fontSize: {
        '4.5xl': ['2.5rem', '3rem'],
      },
      colors: {
        gray: '#F7F7F7',
        primary: '#1A1A1A',
        secondary: '#999999',
        tertiary: '#E2E2E2',
      },
      animation: {
        'slide-left': 'moveSlideshow 15s linear infinite',
      },
      keyframes: {
        moveSlideshow: {
          '100%': {
            transform: 'translateX(-20%)',
          },
        },
        slideLeft: {
          '0%': {
            transform: 'translateX(100%)',
          },
          '100%': {
            transform: 'translateX(0%)',
          },
        },
        slideRight: {
          '0%': {
            transform: 'translateX(0%)',
          },
          '100%': {
            transform: 'translateX(100%)',
          },
        },
      },
      screens: {
        '4xl': '2560px',
        xs: '375px',
      },
      margin: {
        15: '3.75rem',
      },
      padding: {
        full: '100%',
      },
      gridTemplateColumns: {
        header: '1fr auto 1fr',
        'cart-item': 'auto 1fr 1fr',
        article: '33% auto',
      },
      height: {
        7.5: '1.875rem',
        8.5: '2.125rem',
        'blog-image': '527px',
        'caption-image': '815px',
        'caption-image-mobile': '500px',
      },
      width: {
        8.5: '2.125rem',
        110: '27.5rem',
      },
      maxHeight: {
        full: '100%',
        screen: '100vh',
      },
      maxWidth: {
        '3.5xl': '50rem',
        full: '100%',
        screen: '100vw',
      },
      backgroundImage: {
        'split-white-black':
          'linear-gradient(to bottom, white 50% , #1A1A1A 50%);',
      },
      transitionDuration: {
        350: '350ms',
      },
    },
  },
  plugins: [],
};
