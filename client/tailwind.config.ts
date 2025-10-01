import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: '400px',
      // => @media (min-width: 400px) { ... }

      sm: '640px',
      // => @media (min-width: 640px) { ... }

      md: '768px',
      // => @media (min-width: 640px) { ... }

      lg: '1024px',
      // => @media (min-width: 1024px) { ... }

      navbar: '1200px',
      // => @media (min-width: 1200px) { ... }

      xl: '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1400px',
      // => @media (min-width: 1280px) { ... }

      '3xl': '1536px',
      // => @media (min-width: 1280px) { ... }

      'macBook': '1680px',
      // => @media (min-width: 1680px) { ... }

      '4xl': '2000px',
      // => @media (min-width: 1280px) { ... }

      '2k': '2560px',
      // => @media (min-width: 2560px) { ... }
      tabsMobile: { max: '1200px' },
      mobile: { max: '380px' }
      // => @media (max-width: 1200px) { ... }
    },
    extend: {
      fontFamily: {
        afacad: ['var(--font-afacad)', 'sans-serif'],
        newsreader: ['var(--font-newsreader)', 'serif'],
        satoshi: ['var(--font-satoshi)', 'sans-serif'],
      },
      fontSize: {
        'custom': 'min(1.2vw, 18px)',
      },
      boxShadow: {
        'custom-1': '0px 5px 5px -3px #00000033',
        'custom-2': '0px 8px 10px 1px #00000024',
        'custom-3': '0px 3px 14px 2px #0000001F',
        card: "0px 4px 19.2px 0px rgba(0,74,173,0.2)",
      },
      colors: {
        primary: {
          DEFAULT: "#143560",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: '#FFC14B',
          foreground: "#042043",
        },
        black: "#001127",
        pitchBlack: '#000000',
        white: "#ffffff",
        'primary-grey': '#324054',
        'grey-1': "#696A71",
        'grey-2': "#879AB4",
        'grey-3': "#E5E7EB",
        'grey-4': "#696A71",
        'grey-5': "#A2A2A2",
        'grey-6': "#637287",
        lightBlue: '#F4F8FE',
        skyBlue: '#CCE2FF',
        navBlue: '#D5E7FF',
        Green: '#3CBF6C',
        Red: '#F85050',
        Orange: '#FF7700',
        blueText: '#C1CEED',
        cream: '#FFFAF0'
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        // use 1s ease-out for both directions
        "accordion-down": "accordion-down 0.3s ease-out",
        "accordion-up": "accordion-up 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
