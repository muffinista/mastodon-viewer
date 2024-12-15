<script>
	import Profile from './Profile.svelte';
	import Attachment from './Attachment.svelte';

	let { content, id, published, profile, attachment, tags } = $props();

	const dateOptions = {
		dateStyle: 'short',
		timeStyle: 'short'
	};

	let wrapper;

	$effect(() => {
		wrapper.querySelectorAll('a.hashtag').forEach((el) => {
			const parts = el.href.split('/');
			const hashtag = parts[parts.length - 1];
			el.href = `#/tag/${hashtag}`;
		});
	});
</script>

<article class="status">
	<header>
		<Profile {profile} />
	</header>
	<div class="content" bind:this={wrapper}>
		{@html content}
	</div>
	<div class="attachments">
		{#each attachment as a}
			<Attachment attachment={a} />
		{/each}
	</div>
	<div class="tags">
		{#each tags as t}
			<a href="#/tag/{t}">#{t}</a>
		{/each}
	</div>
	<footer>
		<a href="#/status/{id}">{new Date(published).toLocaleString(undefined, dateOptions)}</a>
	</footer>
</article>
