<script>
import PouchDB from 'pouchdb';

export const ssr = false;
let blob = $state();
let {src, alt} = $props();

const db = new PouchDB('toot-archive');

src = src.replace(/^\/media_attachments/, 'media_attachments');

db.get(src, {attachments: true, binary: true}).then((result) => {
  const data = result._attachments[src].data;
  blob = URL.createObjectURL(data);
}).catch((err) => {
  console.log("BOOOO", src, err);
})
</script>

<img src="{blob}" alt="{alt}">
