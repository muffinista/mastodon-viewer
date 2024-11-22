<script>
	import Pagination from '$lib/components/Pagination.svelte';
	import Status from '$lib/components/Status.svelte';
  import ProfileHeader from './ProfileHeader.svelte';
	
	let { 
		data,
		content = $bindable()
	} = $props();

	let page = $state(0);
	const perPage = 20;
	let values = $derived(data.toots.slice(page * perPage, (page + 1) * perPage));

	function reset() {
		$content = false;
		
	}
</script>

<ProfileHeader profile={data.profile} />

<button onclick={() => reset()}>reset!</button>

{#each values as { id, content, published, sensitive, attachment }, i}
	<Status id={id} content={content} published={published} attachment={attachment} profile={data.profile} />
{/each}

<Pagination rows={data.toots} perPage={perPage} bind:currentPage={page} />
