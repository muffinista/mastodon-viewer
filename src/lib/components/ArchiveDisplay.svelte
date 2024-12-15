<script>
	import Pagination from './Pagination.svelte';
	import Status from './Status.svelte';
	import ProfileHeader from './ProfileHeader.svelte';
	import Modal from './Modal.svelte';
	import { generateWebsiteZip, clearData } from '../data';

	let { data, content = $bindable(), tag = $bindable() } = $props();

	let page = $state(0);
	let query = $state();

	let publicStatuses = $state(true);
	let unlistedStatuses = $state(true);
	let directStatuses = $state(false);

	let showModal = $state(false);
	let showResetModal = $state(false);
	let showDownload = $state(false);

	const perPage = parseInt(document.querySelector('body').dataset.tootsPerPage || 20, 10);
	let values = $derived(applyFilters());
	let paged = $derived(toPaged(values)); 

	let statusMessage = $state("");

	async function reset() {
		clearData();
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

		if (tag !== '' && tag !== undefined) {
			base = base.filter((data) => {
				return (
					data.tags.join(' ').toLowerCase().lastIndexOf(tag.toLowerCase()) !== -1
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
		showDownload = false;

		const archiveHref = await generateWebsiteZip(values, data.profile, (message) => {
			statusMessage = message;
		});

		showDownload = true;

		const el = document.querySelector(".download-link");
		el.href = archiveHref;
		el.download = "mastodon-archive.zip";

	}
</script>

<ProfileHeader profile={data.profile} />

<section class="guts">
	<div class="toots">
		{#each paged as { id, content, published, sensitive, attachment, tags }, i}
			<Status {id} {content} {published} {attachment} {tags} profile={data.profile} />
		{/each}
		<Pagination rows={values} {perPage} bind:currentPage={page} />
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
			<p>You can use this tool to generate a website you can use to host a copy of your archive</p>

			<button onclick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					showModal = true;
				}}>generate website</button>			
		</fieldset>


		<fieldset>
			<button onclick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					showResetModal = true;
				}}>reset!</button>
		</fieldset>
	</aside>
</section>

<Modal bind:showModal>
	<p>This is a pretty basic tool that will do a bunch of file juggling and generate a ZIP file with some HTML and Javascript that you can then upload to a server somewhere to share your toots. It'll apply the visibility settings and any search terms you've specified.</p>

	<p>All of this work is done in your browser -- nothing is every uploaded </p>

	<p><b>Note!</b> This is extremely beta code and is probably horribly broken. Please let me know if there are any problems!</p>

	<button onclick={() => generateArchive()}>generate website!</button>

	<p>{statusMessage}</p>
	
	<!-- svelte-ignore a11y_missing_attribute -->
	<a class="download-link" class:hidden={!showDownload}>download!</a>
</Modal>


<Modal bind:showModal={showResetModal}>
	<p>
		Use this button to delete your archive from your browser cache.
	</p>

	<button onclick={() => reset()}>reset!</button>
</Modal>