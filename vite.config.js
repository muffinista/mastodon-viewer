import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
			allowNodeBuiltins: ['pouchdb-browser', 'pouchdb-utils']
	}
});
