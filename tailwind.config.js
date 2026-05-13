/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {   
      keyframes: {
        'slide-bar': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
      animation: {
        'spin-slow': 'spin 40s linear infinite',
        'pulse-slow': 'pulse 6s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'slide-bar': 'slide-bar 2.8s ease-out forwards',

      },
      x: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
       screens: {
      'min-phone-small': { raw: '(min-height: 500px)' }, // special case, not width-based
      'movetosmallscreenpermanently': '450px',
      'md_profile_complete': '450px',
      'lg_profile_complete': '600px',
      'small': '650px',
      'homecommunitybarscreen': '800px',
      'homeleftbarscreen': '1000px',
    },
      keyframes: {

        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        slideUp: 'slideUp 0.6s ease-out forwards',
      }
      ,
      colors: {
        primary: '#1e40af', 
        secondary: '#facc15',
        myhover: '#4f46e5',
        quantanary: '',
        fifth: '',



        dark: 'rgb(0, 0, 0)', 

        dark1: 'rgba(10, 10, 10, 0.7)',
        dark_primary: 'rgb(23, 23, 23)',
        
        dark_primary2: 'rgb(8, 8, 8)', 
        dark_secondary: 'rgb(38 ,38, 38)', 
        dark_tertialy: 'rgb(64, 64 ,64)', 
        card_dark: 'rgba(218, 209, 209, 0.9)',
      
        card_dark6: 'rgba(78, 77, 77, 0.2)', 
        card_dark6_hov: 'rgba(77, 65, 65, 0.2)',
        card_dark2: 'rgba(34, 33, 33, 0.9)', 
      
        card_category_dark: 'rgba(20, 20, 20, 0.8)', 
        card_search_dark: 'rgb(0, 0, 0)',

        my_gray: 'rgb(17 ,24, 39)',

        light: 'rgb(250 ,250 ,250)', 
        light1: 'rgba(250 ,250 ,250, .8)', 
        light_primary: 'rgb(245, 245 ,245)', 
        light_secondary: 'rgb(229 ,229 ,229)', 
        light_secondary2: 'rgb(223, 214, 214)', 
        light_tertialy: 'rgb(212 ,212 ,212)', 

        dark_font: 'hsl(41, 90.50%, 50.40%)',
        light_font: 'hsl(60, 1.10%, 34.10%)',

      
        
      },
      fontFamily: {
        sans: ['Roboto','Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        xs: "10px",
        "4xl": "2rem",
        "5xl": "1.5rem",
        custom: "1rem",
      },
      boxShadow: {
        'light-glow': '0 5px 7px rgba(2, 2, 2, 0.3)',
        'dark-glow': '0 5px 7px rgba(255, 255, 255, 0.3)',


        'light-glow_nav': '0 1px 10px rgba(49, 47, 47, 0.7)',
        'dark-glow_nav': '0 1px 5px rgba(177, 165, 165, 0.7)',
        'card-light': '3px 20px 20px rgb(201, 193, 193)',

        'light-deep': '0 8px 12px rgba(2, 2, 2, 0.3)',
        'dark-deep': '0 8px 12px rgba(255, 255, 255, 0.3)',
      }
    },
  },
  scrollBehavior: ['responsive'],
  plugins: [],
}
