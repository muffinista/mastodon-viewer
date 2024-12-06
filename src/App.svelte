<script>
	import { onMount } from 'svelte';
	import ArchiveDisplay from './lib/components/ArchiveDisplay.svelte';
	import StatusDisplay from './lib/components/StatusDisplay.svelte';
	import ZipChooser from './lib/components/ZipChooser.svelte';
	import { content } from './lib/archive.js';
	import { loadAll } from './lib/data.js';
	import { url } from './lib/url.js';

	export const ssr = false;

	// This can be false if you're using a fallback (i.e. SPA mode)
	export const prerender = true;
	export const trailingSlash = 'always';

	let loaded = $state(false);
	let data = $state();
	let status_id = $derived(checkForStatus());

	function checkForStatus() {
		if ($url.hash.lastIndexOf('status/') === -1) {
			return undefined;
		}
		return $url.hash.split('/')[2];
	}

	onMount(async () => {
		data = await loadAll();
		loaded = true;
	});
</script>

{#if loaded}
	{#if $content == true}
		{#if status_id !== undefined}
			<StatusDisplay {data} {status_id} />
		{:else}
			<ArchiveDisplay {data} {content} {status_id} />
		{/if}
	{:else}
		<ZipChooser {content} />
	{/if}
{/if}
