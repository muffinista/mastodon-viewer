<script>
  import Profile from './Profile.svelte';
  import Attachment from './Attachment.svelte';

  let {content, id, published, profile, attachment} = $props();
</script>

<article>
  <header>
    <Profile profile={profile} />
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
    <a href="/{id}">{published}</a>
  </footer>
</article>

<style>
  article {
    display: flex;
    flex-direction: column;
    margin-bottom: 1.0em;
    border-bottom: 1px solid #dddddd;
    max-width: 800px;
  }
  footer {
    margin-bottom: 0.8em;
    display: flex;
    flex-direction: column;
    align-items: end;
  }
  .attachments {
//    display: grid;
//    grid-template-columns: 1fr 1fr;
//    grid-template-rows: 1fr 1fr;
  }
</style>