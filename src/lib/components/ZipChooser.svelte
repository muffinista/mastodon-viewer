<script>
	import { populateFromArchive } from '../data';


	let files = $state();

	let { content = $bindable() } = $props();

	$effect(async () => {
		if (files) {
			for (const file of files) {
				console.log(file);
				await populateFromArchive(file);
			}
			console.log('done!');

			$content = true;
		}
	});
</script>

<input id="file" name="file" type="file" bind:files /><br />
