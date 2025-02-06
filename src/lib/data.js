import PouchDB from 'pouchdb';
import { BlobReader, BlobWriter, ZipReader, ZipWriter, TextReader } from '@zip.js/zip.js';
import mime from 'mime/lite';

// https://github.com/mastodon/mastodon/blob/main/app/lib/activitypub/tag_manager.rb#L5
function visibilityForStatus(toot) {
	if (toot.object.directMessage === true) {
		return 'direct';
	}

	if (toot.object.to[0]?.lastIndexOf('Public') !== -1) {
		return 'public';
	}

	if (
		toot.object.cc[0]?.lastIndexOf('Public') !== -1 &&
		toot.object.to[0]?.lastIndexOf('/followers') !== -1
	) {
		return 'unlisted';
	}

	if (toot.object.to[0]?.lastIndexOf('/followers') !== -1) {
		return 'private';
	}

	// fallback visibility
	return 'private';
}

export async function loadAll() {
	//await clearData();

	const db = new PouchDB('toot-archive');
	const useFetch = document.querySelector('body').dataset.source !== 'zip';

	try {
		if (useFetch) {
			console.log('load with fetch!');
			await populateFromFetch(db);
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

					// we check two places for tags and visibility since the data will
					// be in different places depending on if we're loading from the original
					// mastodon data or the cleaned data we export
					const visibility = toot.object.visibility || visibilityForStatus(toot);
					const tags =
						toot.object.tags ||
						toot.object.tag
							.filter((t) => t.type === 'Hashtag')
							.map((t) => t.name.replace(/^#/, ''));

					return {
						id: id,
						published: toot.object.published,
						sensitive: toot.object.sensitive,
						content: toot.object.content,
						attachment: toot.object.attachment,
						summary: toot.object.summary,
						visibility,
						tags
					};
				})
				.sort((a, b) => new Date(b.published) - new Date(a.published)),
			profile
		};
	} catch (e) {
		console.log(e);
	}

	return {};
}

async function populateFromFetch(db) {
	const outbox = await fetch('outbox.json').then((result) => result.text());
	const profile = await fetch('actor.json').then((result) => result.text());

	let data = {
		_id: 'outbox.json'
	};

	await db.get('outbox.json', function (err, doc) {
		if (!err) {
			data._rev = doc._rev;
		}
	});

	try {
		await db.put(data);
		const doc = await db.get('outbox.json');
		await db.putAttachment(
			'outbox.json',
			'outbox.json',
			doc._rev,
			new Blob([outbox], {
				type: 'application/json'
			}),
			'text/json'
		);
	} catch (e) {
		console.log(e);
	}

	data = {
		_id: 'actor.json'
	};

	await db.get('actor.json', function (err, doc) {
		if (!err) {
			data._rev = doc._rev;
		}
	});

	try {
		await db.put(data);

		const doc = await db.get('actor.json');
		await db.putAttachment(
			'actor.json',
			'actor.json',
			doc._rev,
			new Blob([profile], {
				type: 'application/json'
			}),
			'text/json'
		);
	} catch (e) {
		console.log(e);
	}
}

export async function clearData() {
	const db = new PouchDB('toot-archive');
	await db.destroy();
}

export async function populateFromArchive(file, callback) {
	if (callback === undefined) {
		callback = console.log;
	}

	const db = new PouchDB('toot-archive');

	// file is a zip let's deal with it
	callback('Loading zip');
	const zipFileReader = new BlobReader(file);

	const zipReader = new ZipReader(zipFileReader);

	const entries = await zipReader.getEntries();

	callback('Processing statuses');

	for (const entry of entries) {
		callback(`processing ${entry.filename}`);

		const mimeType = mime.getType(entry.filename.split('.')?.pop());
		const file = await entry.getData(new BlobWriter(mimeType));

		const data = {
			_id: entry.filename
		};

		try {
			await db.put(data);

			const doc = await db.get(entry.filename);
			await db.putAttachment(entry.filename, entry.filename, doc._rev, file, mimeType);
		} catch {}
	} // for entries

	callback('Done!');
}

// async function fetchAndZip(zipWriter, name, url) {
// 	console.log(`fetch ${url} -> ${name}`);
// 	const src = await fetch(url).then((result) => result.text());
// 	const reader = new TextReader(src);
// 	await zipWriter.add(name, reader);
// }

export async function generateWebsiteZip(statuses, profile, callback) {
	if (callback === undefined) {
		callback = console.log;
	}

	const promises = [];
	const db = new PouchDB('toot-archive');

	const zipFileWriter = new BlobWriter();
	const zipWriter = new ZipWriter(zipFileWriter);

	callback('Generating statuses');
	const statusData = {
		orderedItems: statuses.map((s) => {
			return { object: s };
		})
	};
	const dataReader = new TextReader(JSON.stringify(statusData));
	await zipWriter.add('mastodon-archive/outbox.json', dataReader);

	callback('Generating data');
	const profileReader = new TextReader(JSON.stringify(profile));
	await zipWriter.add('mastodon-archive/actor.json', profileReader);

	// grab icon and image from profile data
	const icon = profile?.icon?.url;
	const image = profile?.image?.url;

	if (icon) {
		const promise = db.get(icon, { attachments: true, binary: true }).then((result) => {
			const data = result._attachments[icon].data;

			const blobReader = new BlobReader(data);
			zipWriter.add(`mastodon-archive/${icon}`, blobReader);
		});
		promises.push(promise);
	}

	if (image) {
		const promise = db.get(image, { attachments: true, binary: true }).then((result) => {
			const data = result._attachments[image].data;

			const blobReader = new BlobReader(data);
			zipWriter.add(`mastodon-archive/${image}`, blobReader);
		});
		promises.push(promise);
	}

	callback('Loading HTML');
	const html = await fetch('index.html').then((result) => result.text());

	const tweakedHtml = html.replace(/data-source="zip"/, 'data-source="fetch"');
	const indexReader = new TextReader(tweakedHtml);
	await zipWriter.add('mastodon-archive/index.html', indexReader);

	// query the index file for attached JS/CSS/assets
	const template = document.createElement('template');
	template.innerHTML = html;

	callback('Finding assets');
	for (const el of Array.from(template.content.querySelectorAll('script'))) {
		const url = new URL(el.src);
		const name = url.pathname.replace(/^\/[^/]+\/assets\//, 'assets/');

		console.log(`fetch ${url} -> ${name}`);
		const src = await fetch(url).then((result) => result.text());
		const reader = new TextReader(src);
		promises.push(zipWriter.add(name, reader));

		// promises.push(fetchAndZip(zipWriter, src.pathname, src));
	}

	for (const el of Array.from(template.content.querySelectorAll('link'))) {
		// const src = new URL(el.href);
		// promises.push(fetchAndZip(zipWriter, src.pathname, src));

		const url = new URL(el.href);
		const name = url.pathname.replace(/^\/[^/]+\/assets\//, 'assets/');

		console.log(`fetch ${url} -> ${name}`);
		const src = await fetch(url).then((result) => result.text());
		const reader = new TextReader(src);
		promises.push(zipWriter.add(`mastodon-archive/${name}`, reader));
	}

	const total = statuses.length;
	let index = 0;

	//
	// generate promises for the actions required to add files to the zip archive
	// using Promise.all should be a little more concurrent/performant
	//
	const actions = statuses.map((status) => {
		index += 1;
		callback(`Adding toot ${index} of ${total}`);

		// const filename = `statuses/${status.id}.html`;

		// const content = html
		// 	.replace(/<body[^>]+>/, `<body data-status-id=${status.id}>`)
		// 	.replace(/src="/g, 'src="..')
		// 	.replace(/href="/g, 'href="..');

		// // add a base href?
		// const statusReader = new TextReader(content);

		// promises.push(zipWriter.add(filename, statusReader));

		for (const attachment of status.attachment) {
			const url = attachment.url.replace(/^\/[^/]+\/media_attachments\//, 'media_attachments/');
			const promise = db.get(url, { attachments: true, binary: true }).then((result) => {
				const data = result._attachments[url].data;

				const blobReader = new BlobReader(data);
				zipWriter.add(`mastodon-archive/${url}`, blobReader);
			});
			promises.push(promise);
		}
	});

	await Promise.all(actions.flat());

	callback('Reticulating splines (this might take a bit)');
	await zipWriter.close();

	// Retrieves the Blob object containing the zip content into `zipFileBlob`. It
	// is also returned by zipWriter.close() for more convenience.
	callback('Grabbing data');
	const zipFileBlob = await zipFileWriter.getData();

	const fileUrl = URL.createObjectURL(zipFileBlob);

	callback('Done!');
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
