<script>
  let {attachment} = $props();
  const url = attachment.url.replace('/muffin-industries', '');
</script>

<div class="attachment">
  <img src="{url}" alt="{attachment.name}" class="thumbnail"/>
</div>

<style>
  .thumbnail {
    max-width: 200px;
    max-height: 200px;
  }
</style>