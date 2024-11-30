<script>
	import Profile from './Profile.svelte';
	import Attachment from './Attachment.svelte';

	let { content, id, published, profile, attachment } = $props();
</script>

<article class="status">
	<header>
		<Profile {profile} />
	</header>
	<div class="content">
		{@html content}
	</div>
	<div class="attachments">
		{#each attachment as a}
			<Attachment attachment={a} />
		{/each}
	</div>
	<footer>
		<a href="/status/{id}">{published}</a>
	</footer>
</article>
