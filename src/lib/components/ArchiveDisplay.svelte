<script>
	import Pagination from '$lib/components/Pagination.svelte';
	import Status from '$lib/components/Status.svelte';
	import ProfileHeader from '$lib/components/ProfileHeader.svelte';

	let { data, content = $bindable() } = $props();

	let page = $state(0);
	let query = $state();

	let publicStatuses = $state(true);
	let unlistedStatuses = $state(true);
	// let privateStatuses = $state(false);
	let directStatuses = $state(false);

	const perPage = parseInt(document.querySelector('body').dataset.tootsPerPage || 20, 10);
	let values = $derived(applyFilters());

	function reset() {
		$content = false;
	}

	function visibilities() {
		const values = [];

		if ( publicStatuses ) {
			values.push('public');
		}
		if ( unlistedStatuses ) {
			values.push('unlisted');
		}

		if ( directStatuses ) {
			values.push('direct');
		}

		return values;
	}

	function applyFilters() {
		let base = data.toots;

		const visibilitiesToInclude = visibilities();

		base = base.filter((data) => {
			return visibilitiesToInclude.includes(data.visibility); 
		});

		if ( query !== "" && query !== undefined ) {
			base = base.filter((data) => {
				return (
					data.content.toLowerCase().lastIndexOf(query.toLowerCase()) !== -1 ||
					data.tags.join(" ").toLowerCase().lastIndexOf(query.toLowerCase()) !== -1
				);
			})
		}

		return base.slice(page * perPage, (page + 1) * perPage);
	}

	function searchKeyDown(event) {
		if ( event.key === "Enter" ) {
			applyFilters();
			event.preventDefault();
			return;
		}
	}
</script>

<ProfileHeader profile={data.profile} />

<section class="guts">
	<div class="toots">
		{#each values as { id, content, published, sensitive, attachment, tags }, i}
			<Status {id} {content} {published} {attachment} {tags} profile={data.profile} />
		{/each}
		<Pagination rows={data.toots} {perPage} bind:currentPage={page} />
	</div>	

	<aside class="controls">
		<h1>Filters</h1>
		<form>
			<fieldset>
				<label>
					<input type="checkbox" bind:checked={publicStatuses} onchange={applyFilters} />
					Include public statuses
				</label>
				<label>
					<input type="checkbox" bind:checked={unlistedStatuses} onchange={applyFilters} />
					Include unlisted statuses
				</label>
				<label>
					<input type="checkbox" bind:checked={directStatuses} onchange={applyFilters} />
					Include private statuses
				</label>
			</fieldset>	
			<fieldset>
				<input type="text" bind:value="{query}" placeholder="search" onkeydown={searchKeyDown} />
			</fieldset>
		</form>

		<form>
			<fieldset>
				<button onclick={() => reset()}>reset!</button>
			</fieldset>
		</form>
	</aside>
	
</section>

