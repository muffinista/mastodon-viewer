<script>
import { populate } from '$lib/data.js';

export const ssr = false;

let files = $state();

let {
  content = $bindable()
} = $props();

$effect(async () => {
  if (files) {
    // Note that `files` is of type `FileList`, not an Array:
    // https://developer.mozilla.org/en-US/docs/Web/API/FileList
    console.log(files);

    for ( const file of files ) {
      console.log(file);
      await populate(file);
    }
    console.log("done!");

    $content = true;
  }
});
</script>

<input id="file" name="file" type="file" bind:files /><br />
