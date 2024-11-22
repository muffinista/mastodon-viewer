<script>
  // https://svelte.dev/playground/84a8d64a6f1e49feba8f6a491ecc55f5?version=3.35.0

  let {
    rows, 
    perPage,
    currentPage = $bindable(0)
  } = $props();

  let totalRows = $derived(rows.length); 
  let totalPages = $derived(Math.ceil(totalRows / perPage));
  let start =  $derived(currentPage * perPage);
  let end = $derived(currentPage === totalPages - 1 ? totalRows - 1 : start + perPage - 1);
</script>


{#if totalRows && totalRows > perPage}
  <div class='pagination'>
    <button onclick={() => currentPage -= 1} 
        disabled={currentPage === 0 ? true : false} 
        aria-label="left arrow icon" 
        aria-describedby="prev">
        &lt;
    </button>
    <span id='prev' class='sr-only'>Load previous {perPage} rows</span>
    <p>{start + 1} - {end + 1} of {totalRows}</p>
    <button onclick={() => currentPage += 1} 
        disabled={currentPage === totalPages - 1 ? true : false} 
        aria-label="right arrow icon" 
        aria-describedby="next">
    &gt;
    </button>
    <span id='next' class='sr-only'>Load next {perPage} rows</span>
  </div>
{/if}
