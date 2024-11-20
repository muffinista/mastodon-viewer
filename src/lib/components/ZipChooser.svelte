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

      // Creates a ZipReader object reading the zip content via `zipFileReader`,
      // retrieves metadata (name, dates, etc.) of the first entry, retrieves its
      // content via `helloWorldWriter`, and closes the reader.
      const zipReader = new ZipReader(zipFileReader);

      const entries = await zipReader.getEntries();
      console.log(entries);

      for ( const entry of entries ) {
        // console.log(entry);
        const mimeType = mime.getType(entry.filename.split('.')?.pop());

        // return URL.createObjectURL(
				const file = await entry.getData(new BlobWriter(mimeType));
        // console.log(file);

        const data = {
          '_id': entry.filename,
        }
        // const result = await db.put(data);
        // console.log(result);

        console.log("PUT", data);
        db.put(data, function callback(err, result) {
          if (!err) {
          } else {
            console.log(err);
          }
        });

        const doc = await db.get(entry.filename);
        console.log(doc);

        console.log("PUT ATTACHMENT", entry.filename);
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

<input id="file"  name="file" type="file" bind:files /><br />
