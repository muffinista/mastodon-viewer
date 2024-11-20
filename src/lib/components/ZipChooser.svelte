<script>
import PouchDB from 'pouchdb';
import { BlobReader, BlobWriter, ZipReader } from "@zip.js/zip.js";
import mime from 'mime/lite';

export const ssr = false;

let files = $state();
const db = new PouchDB('toot-archive');

let {
  content = $bindable()
} = $props();

$effect(async () => {
  if (files) {
    // Note that `files` is of type `FileList`, not an Array:
    // https://developer.mozilla.org/en-US/docs/Web/API/FileList
    console.log(files);

    for ( const file of files ) {
      // file is a zip let's deal with it
      const zipFileReader = new BlobReader(file);

      const zipReader = new ZipReader(zipFileReader);

      const entries = await zipReader.getEntries();
      console.log(entries);

      for ( const entry of entries ) {
        // console.log(entry);
        const mimeType = mime.getType(entry.filename.split('.')?.pop());
				const file = await entry.getData(new BlobWriter(mimeType));

        const data = {
          '_id': entry.filename,
        }

        db.put(data, function callback(err, result) {
          if (!err) {
          } else {
            console.log(err);
          }
        });

        const doc = await db.get(entry.filename);

        db.putAttachment(entry.filename, entry.filename, doc._rev, file, mimeType, function callback(err, result) {
          if (!err) {
          } else {
            console.log(err);
          }
        });

      } // for entries

    }

    $content = true;
  }
});
</script>

<input id="file" name="file" type="file" bind:files /><br />
