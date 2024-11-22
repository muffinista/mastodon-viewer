<script>
import { getBlob } from '$lib/data.js';

export const ssr = false;
let {src, alt} = $props();
let blob = $state(getBlob(src));
</script>

{#await blob}
...
{:then blob}
<img src={blob} alt={alt} />
{/await}