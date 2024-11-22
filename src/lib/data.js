import PouchDB from 'pouchdb';
import { BlobReader, BlobWriter, ZipReader } from "@zip.js/zip.js";
import mime from 'mime/lite';

export const ssr = false;


export async function loadAll() {
	const db = new PouchDB('toot-archive');
	const outboxRaw = await db.get('outbox.json', {attachments: true, binary: true});
	const outbox = JSON.parse(await outboxRaw._attachments['outbox.json'].data.text());

	const profileRaw = await db.get('actor.json', {attachments: true, binary: true});
	const profile = JSON.parse(await profileRaw._attachments['actor.json'].data.text());

	// @todo check visibility
	return {
		toots: outbox.orderedItems
			// 'Announce' is for boosts, ignore for now since they don't have any data really
			.filter((toot) => toot.type !== 'Announce')
			.map((toot) => {
			const id = toot.object.id.split(/\//).slice(-1)[0];

			return {
				id: id,
				published: toot.object.published,
				sensitive: toot.object.sensitive,
				content: toot.object.content,
				attachment: toot.object.attachment
			}  
		})
		.reverse(),
		profile
	};
}

export async function populate(file) {
	const db = new PouchDB('toot-archive');

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
        // console.log(err);
      }
    });

    const doc = await db.get(entry.filename);

    db.putAttachment(entry.filename, entry.filename, doc._rev, file, mimeType, function callback(err, result) {
      if (!err) {
      } else {
        // console.log(err);
      }
    });

  } // for entries
}