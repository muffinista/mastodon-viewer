<script>
	import BlobImage from './BlobImage.svelte';
	let { profile } = $props();
</script>

<header>
	<div class="background">
		<a href="/"><BlobImage src={profile.image.url} alt="" /></a>
	</div>

	<div class="account-info">
		<a href="/">
			<BlobImage src={profile.icon.url} alt="profile" />
			{profile.name}
		</a>
		{@html profile.summary}
	</div>
</header>
