<script>
	import Status from './Status.svelte';
	import ProfileHeader from './ProfileHeader.svelte';

	let { data, status_id } = $props();

	let status = $derived(findStatus());

	function findStatus() {
		return data.toots.find((t) => t.id === status_id);
	}
</script>

<ProfileHeader profile={data.profile} />

<section class="guts">
	<div class="toots">
		<Status
			id={status.id}
			summary={status.summary}
			content={status.content}
			published={status.published}
			attachment={status.attachment}
			tags={status.tags}
			profile={data.profile}
		/>
	</div>
</section>
