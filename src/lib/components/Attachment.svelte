<script>
  import BlobImage from '$lib/components/BlobImage.svelte';
  import Modal from '$lib/components/Modal.svelte';

  let {attachment} = $props();
  const url = attachment.url.replace('/muffin-industries', '');

  let showModal = $state(false);
</script>

<div class="attachment">
  <a href="#" class="thumbnail" onclick={() => (showModal = true)}>
    <BlobImage src={url} alt={attachment.name} />
  </a>
</div>

<Modal bind:showModal>
  <BlobImage src={url} alt={attachment.name} />
</Modal>

<style>
</style>