<script>
  let {profile} = $props();
</script>

<div class="profile">
  <a href="{profile.url}"
    target="_blank"
    rel="noopener noreferrer"
    title="{profile.name}">
    <div class="avatar">
      <img
        src="{profile.icon.url}"
        alt=""
      />
    </div>
    <div class="display-name">
      <bdi><strong class="display-name__html">{profile.name}</strong></bdi>
      <span class="display-name__account">@{profile.preferredUsername}</span>
    </div>
  </a>
</div>

<style>
  .profile > a {
    display: flex;
  }
  .avatar {
    width: 46px;
    height: 46px;
    margin-right: 0.5em;
  }
  .avatar > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 5px;
  }

  .display-name {
    display: flex;
    flex-direction: column;
  }
</style>