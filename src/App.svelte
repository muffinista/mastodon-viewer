<script>
import { onMount } from 'svelte';
import ArchiveDisplay from './lib/components/ArchiveDisplay.svelte';
import ZipChooser from './lib/components/ZipChooser.svelte';
import { content } from './lib/archive.js';
import { loadAll } from './lib/data.js';

export const ssr = false;

// This can be false if you're using a fallback (i.e. SPA mode)
export const prerender = true;
export const trailingSlash = 'always';

let loaded = $state(false);
let data = $state();

onMount(async () => {
  data = await loadAll();
  loaded = true;
});
</script>

{#if loaded}
  {#if $content == true}
    <ArchiveDisplay {data} {content} />
  {:else}
    <ZipChooser {content} />
  {/if}
{/if}