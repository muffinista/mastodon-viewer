<script>
	import BlobImage from './BlobImage.svelte';
	import Modal from './Modal.svelte';

	let { attachment } = $props();
	const url = attachment.url.replace('/muffin-industries', '');

	let showModal = $state(false);
</script>

<div class="attachment">
	<a
		href={url}
		class="thumbnail"
		onclick={(e) => {
			e.preventDefault();
			e.stopPropagation();
			showModal = true;
		}}
	>
		<BlobImage src={url} alt={attachment.name} />
	</a>
</div>

<Modal bind:showModal>
	<BlobImage src={url} alt={attachment.name} />
</Modal>
