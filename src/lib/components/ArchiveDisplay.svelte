<script>
	import Pagination from './Pagination.svelte';
	import Status from './Status.svelte';
	import ProfileHeader from './ProfileHeader.svelte';
	import { generateWebsiteZip } from '../data';

	let { data, content = $bindable() } = $props();

	let page = $state(0);
	let query = $state();

	let publicStatuses = $state(true);
	let unlistedStatuses = $state(true);
	let directStatuses = $state(false);

	const perPage = parseInt(document.querySelector('body').dataset.tootsPerPage || 20, 10);
	let values = $derived(applyFilters());
	let paged = $derived(toPaged(values)); 

	function reset() {
		$content = false;
	}

	function visibilities() {
		const values = [];

		if (publicStatuses) {
			values.push('public');
		}
		if (unlistedStatuses) {
			values.push('unlisted');
		}

		if (directStatuses) {
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

		if (query !== '' && query !== undefined) {
			base = base.filter((data) => {
				return (
					data.content.toLowerCase().lastIndexOf(query.toLowerCase()) !== -1 ||
					data.tags.join(' ').toLowerCase().lastIndexOf(query.toLowerCase()) !== -1
				);
			});
		}

		return base;
	}

	function toPaged(base) {
		return base.slice(page * perPage, (page + 1) * perPage);
	}

	function searchKeyDown(event) {
		if (event.key === 'Enter') {
			applyFilters();
			event.preventDefault();
			return;
		}
	}

	async function generateArchive() {
		const archiveHref = await generateWebsiteZip(values, data.profile);
		const el = document.querySelector(".download-link");
		el.href = archiveHref;
		el.download = "mastodon-archive.zip"
	}
</script>

<ProfileHeader profile={data.profile} />

<section class="guts">
	<div class="toots">
		{#each paged as { id, content, published, sensitive, attachment, tags }, i}
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
				<input type="text" bind:value={query} placeholder="search" onkeydown={searchKeyDown} />
			</fieldset>
		</form>

		<fieldset>
			<button onclick={() => generateArchive()}>generate archive!</button>
			<a class="download-link" href="">download!</a>
		</fieldset>

		<fieldset>
			<button onclick={() => reset()}>reset!</button>
		</fieldset>
	</aside>
</section>
