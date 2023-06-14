const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: [
    './components/**/*.{js,ts,jsx,tsx}', 
    './pages/**/*.{js,ts,jsx,tsx}', 
    // From file 2
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: false, 
  theme: {
    extend: {
      fontFamily: {
        sans: ['Public Sans', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'darker-blue': '#343541',
        'darkish-grey' : '#444654',
        'dark-gray': '#202123',
        primary: {
          'dark-blue': 'hsl(204, 74%, 46%)',
          'lime-green': 'hsl(136, 65%, 51%)',
          'bright-cyan': 'hsl(197, 98%, 60%)',
          black: 'hsl(0, 0%, 0%)',
        },
        neutral: {
          'grayish-blue': '#0066cc',
          'light-grayish-blue': 'hsl(220, 16%, 96%)',
          'very-light-gray': 'hsl(0, 0%, 98%)',
          white: 'hsl(0, 0%, 100%)',
        },
      },
      backgroundImage: (theme) => ({
        'header-desktop': "url('/images/bg-intro-desktop.svg')",
        'header-mobile': "url('/images/bg-intro-mobile.svg')",
        'image-mockups': "url('/images/image-mockups.png')",
      }),
      backgroundSize: {
        'custom-mobile-header-size': '100% 50%',
        'custom-mobile-mockup-size': 'auto 60%',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1.25rem',
          sm: '2rem',
          lg: '3rem',
          xl: '4rem',
          '2xl': '5rem',
        },
      },
      inset: {
        '-42.6%': '-42.6%',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    // From file 2
    require('@tailwindcss/typography'), 
    require('@tailwindcss/forms')
  ],
};
