import PouchDB from 'pouchdb';
import { BlobReader, BlobWriter, ZipReader, ZipWriter, TextReader } from '@zip.js/zip.js';
import mime from 'mime/lite';

export async function loadAll() {
	const db = new PouchDB('toot-archive');
	const useFetch = document.querySelector('body').dataset.source !== 'zip';

	try {
		if (useFetch) {
			console.log('load with fetch!');
			await populateFromFetch();
		}

		const outboxRaw = await db.get('outbox.json', { attachments: true, binary: true });
		const outbox = JSON.parse(await outboxRaw._attachments['outbox.json'].data.text());

		const profileRaw = await db.get('actor.json', { attachments: true, binary: true });
		const profile = JSON.parse(await profileRaw._attachments['actor.json'].data.text());

		return {
			db,
			toots: outbox.orderedItems
				// 'Announce' is for boosts, ignore for now since they don't have any data really
				.filter((toot) => toot.type !== 'Announce')
				.map((toot) => {
					const id = toot.object.id.split(/\//).slice(-1)[0];
					let visibility;

					if (toot.object.directMessage === true) {
						visibility = 'direct';
					} else if (
						toot.object.to[0]?.lastIndexOf('Public') !== -1 ||
						toot.object.cc[0]?.lastIndexOf('Public') !== -1
					) {
						visibility = 'public';
					} else if (
						toot.object.to[0]?.lastIndexOf('/followers') !== -1 ||
						toot.object.cc[0]?.lastIndexOf('/followers') !== -1
					) {
						visibility = 'unlisted';
					} else {
						// console.log(toot);
					}
					// gotta figure out what differentiates direct and private here

					const tags = toot.object.tag
						.filter((t) => t.type === 'Hashtag')
						.map((t) => t.name.replace(/^#/, ''));

					return {
						id: id,
						published: toot.object.published,
						sensitive: toot.object.sensitive,
						content: toot.object.content,
						attachment: toot.object.attachment,
						visibility,
						tags
					};
				})
				.reverse(),
			profile
		};
	} catch (e) {
		console.log(e);
	}

	return {};
}

async function populateFromFetch() {
	const outbox = await fetch('outbox.json').then((result) => result.json());
	const profile = await fetch('actor.json').then((result) => result.json());

	const data = {
		_id: 'outbox.json'
	};

	try {
		await db.put(data);

		const doc = await db.get('outbox.json');
		await db.putAttachment('outbox.json', 'outbox.json', doc._rev, outbox, 'text/json');
	} catch (e) {
		console.log(e);
	}

	data._id = 'actor.json';

	try {
		await db.put(data);

		const doc = await db.get('actor.json');
		await db.putAttachment('actor.json', 'actor.json', doc._rev, profile, 'text/json');
	} catch (e) {
		console.log(e);
	}
}

export async function populateFromArchive(file) {
	const db = new PouchDB('toot-archive');

	// file is a zip let's deal with it
	const zipFileReader = new BlobReader(file);

	const zipReader = new ZipReader(zipFileReader);

	const entries = await zipReader.getEntries();
	console.log(entries);

	for (const entry of entries) {
		const mimeType = mime.getType(entry.filename.split('.')?.pop());
		const file = await entry.getData(new BlobWriter(mimeType));

		const data = {
			_id: entry.filename
		};

		try {
			await db.put(data);

			const doc = await db.get(entry.filename);
			await db.putAttachment(entry.filename, entry.filename, doc._rev, file, mimeType);
		} catch (e) {}
	} // for entries
}


async function fetchAndZip(zipWriter, name, url) {
	console.log(`fetch ${url} -> ${name}`);
	const src = await fetch(url).then((result) => result.text());
	const reader = new TextReader(src);
	return zipWriter.add(name, reader);	
}

export async function generateWebsiteZip(statuses, profile, callback) {
	if ( callback === undefined ) {
		callback = console.log;
	}

	const zipFileWriter = new BlobWriter();
	const zipWriter = new ZipWriter(zipFileWriter);

	callback("Generating statuses");
	const dataReader = new TextReader(JSON.stringify(statuses));
	await zipWriter.add("outbox.json", dataReader);

	callback("Generating data");
	const profileReader = new TextReader(JSON.stringify(profile));
	await zipWriter.add("actor.json", profileReader);

	const db = new PouchDB('toot-archive');

	callback("Loading HTML");
	const html = await fetch("index.html").then((result) => result.text());

	const indexReader = new TextReader(html);
	await zipWriter.add("index.html", indexReader);

	// query the index file for attached JS/CSS/assets
	const template = document.createElement('template');
	template.innerHTML = html;


	callback("Finding assets");
	for (const el of Array.from(template.content.querySelectorAll('script'))) {
		const src = new URL(el.src);
		await fetchAndZip(zipWriter, src.pathname, src);
	}	

	for (const el of Array.from(template.content.querySelectorAll('link'))) {
		const src = new URL(el.href);
		await fetchAndZip(zipWriter, src.pathname, src);
	}	

	const total = statuses.length;
	let index = 0;

	//
	// generate promises for the actions required to add files to the zip archive
	// using Promise.all should be a little more concurrent/performant
	//
	const actions = statuses.map(status => {
		index += 1;
		callback(`Adding toot ${index} of ${total}`);
	
		const promises = [];

		const filename = `statuses/${status.id}.html`;

		const content = html
			.replace(/<body[^>]+>/, `<body data-status-id=${status.id}>`)
			.replace(/src="/g, 'src="..')
			.replace(/href="/g, 'href="..');

		// add a base href?
		const statusReader = new TextReader(content);

		promises.push(zipWriter.add(filename, statusReader));

		for (const attachment of status.attachment) {
			const url = attachment.url.replace(/^\/[^/]+\/media_attachments\//, 'media_attachments/');
			const promise = db.get(url, { attachments: true, binary: true }).then((result) => {
				const data = result._attachments[url].data;

				const blobReader = new BlobReader(data);	
				zipWriter.add(url, blobReader);
			})
			promises.push(promise);	
		}
	});

	await Promise.all(actions.flat());

	callback("Reticulating splines (this might take a bit)");
	await zipWriter.close();	

	// Retrieves the Blob object containing the zip content into `zipFileBlob`. It
	// is also returned by zipWriter.close() for more convenience.
	callback("Grabbing data");
	const zipFileBlob = await zipFileWriter.getData();

	const fileUrl = URL.createObjectURL(zipFileBlob);

	callback("Done!");
	return fileUrl;
}

export async function getUrlToFile(src) {
	const useFetch = document.querySelector('body').dataset.source !== 'zip';

	if (useFetch) {
		return src;
	}

	const db = new PouchDB('toot-archive');
	src = src.replace(/^\/media_attachments/, 'media_attachments');

	const result = await db.get(src, { attachments: true, binary: true });
	const data = result._attachments[src].data;
	return URL.createObjectURL(data);
}
