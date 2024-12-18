<script>
	import { populateFromArchive } from '../data';


	let files = $state();
	let statusMessage = $state("");

	let { onComplete } = $props();

	$effect(async () => {
		if (files) {
			for (const file of files) {
				// console.log(file);
				await populateFromArchive(file, (message) => {
					statusMessage = message;
				});
			}

			statusMessage = "Loading UI";
			onComplete();
		}
	});
</script>

<section class="guts">
	<div>
		<h1>Mastodon Archive Viewer</h1>

		<p>You can use this page to view an archive of your toots, and to generate a website you can publish somewhere to share your archive with others. This tool works 100% within your browser -- nothing is uploaded to this server, and your data isn't shared with anyone else.</p>

		<p>To get started, specify your archive zip file here:</p>

		<input id="file" name="file" type="file" bind:files /><br />

		<p>{statusMessage}</p>
	</div>
</section>