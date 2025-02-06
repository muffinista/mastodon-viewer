<script>
	import { onMount } from 'svelte';
	import ArchiveDisplay from './lib/components/ArchiveDisplay.svelte';
	import StatusDisplay from './lib/components/StatusDisplay.svelte';
	import ZipChooser from './lib/components/ZipChooser.svelte';
	import { content } from './lib/archive.js';
	import { loadAll } from './lib/data.js';
	import { url } from './lib/url.js';

	let loaded = $state(false);
	let data = $state();
	let status_id = $derived(checkForStatus());
	let tag = $derived(checkForTag());

	const showExport = document.querySelector('body').dataset.source !== 'fetch';

	function checkForStatus() {
		if (document.querySelector('body').dataset.statusId) {
			return document.querySelector('body').dataset.statusId;
		}

		if ($url.hash.lastIndexOf('status/') !== -1) {
			return $url.hash.split('/')[2];
		}

		return undefined;
	}

	function checkForTag() {
		if ($url.hash.lastIndexOf('tag/') !== -1) {
			return $url.hash.split('/')[2];
		}

		return undefined;
	}

	let onComplete = async function onComplete() {
		data = await loadAll();
		loaded = true;
		$content = true;
	};

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
			<ArchiveDisplay {data} {content} {tag} {showExport} />
		{/if}
	{:else}
		<ZipChooser {onComplete} />
	{/if}
{/if}

<footer class="footer">
	<a href="https://github.com/muffinista/mastodon-viewer">Mastodon Viewer on GitHub</a>. Please
	report any problems/issues!
</footer>
