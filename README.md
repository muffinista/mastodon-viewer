# Mastodon Archive Viewer

This is the code for a website that can parse a mastodon account archive and generate a browsable/searchable archive. It can also generate a zip file that will contain code for a website that a user can upload somewhere to share their archive with others.

The code is entirely browser based -- nothing is uploaded to a server.

## Running the code

The site is built using [`svelte`](https://svelte.dev/). You should be able to get up and running by cloning the code, and running something like:

```
npm i
npm run dev
```

You should see some output like this:

```

  VITE v6.0.2  ready in 1035 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
[vite-plugin-static-copy] Collected 1 items.

```

And you should be able to view the development server at http://localhost:5173/

## How it works

`ZipChooser.svelte` asks the user to specify a Zip file of their mastodon archive on their local computer. Then `populateFromArchive` parses and loads the archive data, and stores it in a local instance of [PouchDB](https://pouchdb.com/). Each file is stored as an attachment in the database, including media files, etc.

`ArchiveDisplay.svelte` is used to output the toots, user profile, etc.

A user can choose to generate a website from their archive. The `generateWebsiteZip` function does this work. It basically makes another zip file that contains a lightly filtered copy of the users toots, all their media, etc. It actually uses the same HTML/JS as the archive tool itself, although the `populateFromFetch` function is called to load the data.

## Building

To create a production version:

```
npm run build
```

This will build a production version of the codebase and drop it into the `dist/` directory. The tool is designed to be reasonably portable, so there will only be an `index.html`, and a JS/CSS file in the `assets` directory. Upload those to a web server and you should be good to go.

Alternatively, you might want to check out svelte's deployment [adapters](https://svelte.dev/docs/kit/adapters) for your target environment.
