// import { sveltekit } from '@sveltejs/kit/vite';
// import { defineConfig } from 'vite';

// export default defineConfig({
// 	plugins: [sveltekit()],
// 	optimizeDeps: {
// 		allowNodeBuiltins: ['pouchdb-browser', 'pouchdb-utils']
// 	}
// });

import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
	optimizeDeps: {
		allowNodeBuiltins: ['pouchdb-browser', 'pouchdb-utils']
	}
})
