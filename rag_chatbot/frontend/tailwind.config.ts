import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0b0f19'
        }
      }
    }
  },
  plugins: []
};

export default config;
