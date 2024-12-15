<script>
	import { getUrlToFile } from '../data.js';

	let { src, alt } = $props();
	let blob = $state(getUrlToFile(src));
</script>

{#await blob}
	...
{:then blob}
	<img src={blob} {alt} title={alt} />
{/await}
