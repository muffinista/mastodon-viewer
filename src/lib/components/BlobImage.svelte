<script>
	import { getUrlToFile } from '$lib/data.js';

	export const ssr = false;
	let { src, alt } = $props();
	let blob = $state(getUrlToFile(src));
</script>

{#await blob}
	...
{:then blob}
	<img src={blob} {alt} />
{/await}
