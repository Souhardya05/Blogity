const config = {
  plugins: {
    // We removed 'tailwindcss/nesting'
    // Use the new @tailwindcss/postcss package
    '@tailwindcss/postcss': {
      config: './tailwind.config.ts',
    },
    autoprefixer: {},
  },
};

export default config;

