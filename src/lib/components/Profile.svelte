<script>
	import BlobImage from './BlobImage.svelte';
	let { profile } = $props();
</script>

<div class="profile">
	<a href={profile.url} target="_blank" rel="noopener noreferrer" title={profile.name}>
		<div class="avatar">
			<BlobImage src={profile.icon.url} alt="profile" />
		</div>
		<div class="display-name">
			<bdi><strong class="display-name__html">{profile.name}</strong></bdi>
			<span class="display-name__account">@{profile.preferredUsername}</span>
		</div>
	</a>
</div>
