import { defineConfig } from 'vite';

export default defineConfig({
  // base is usually '/', unless you're deploying to a sub-path.
  base: '/',  // Set base path to the root

  build: {
    outDir: 'dist', // Your build output directory
  },

  server: {
    open: true, // Opens the app in the default browser on server start
  },

  // This can be omitted unless you want to fine-tune how assets are handled during the build
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
});
