import { writable } from 'svelte/store';

import PouchDB from 'pouchdb';

export const ssr = false;

const db = new PouchDB('toot-archive');

export const content = writable(false);


// Anytime the store changes, update the local storage value.
content.subscribe((value) => {
  value = typeof(value) === 'boolean' ? value : value === 'true';
  console.log('hasData', value);
  if ( value === null || value === undefined || value === 'undefined') {
    localStorage.removeItem('hasData');
  } else {
    localStorage.setItem('hasData', value);
  }
});

// Get the value out of storage on load.
content.set(localStorage.getItem('hasData') || false);

// db.get('outbox.json', function callback(err, result) {
//   if ( err ) {
//     console.log(err);
//     content.set(false);
//   } else {
//     console.log(result);
//     content.set(true);
//   }
// });

