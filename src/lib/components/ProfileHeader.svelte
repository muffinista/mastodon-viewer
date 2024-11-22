<script>
import BlobImage from '$lib/components/BlobImage.svelte';
let {profile} = $props();
</script>

<header>
  <div class="background">
    <BlobImage src={profile.image.url} alt="" />
  </div>

  <div class="account-info">
    <BlobImage src={profile.icon.url} alt="profile" />
    {profile.name}
    {@html profile.summary}
  </div>
</header>
