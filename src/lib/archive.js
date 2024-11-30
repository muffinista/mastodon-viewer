import { writable } from 'svelte/store';

export const ssr = false;

export const content = writable(false);

function trueOrTrue(value) {
	return typeof value === 'boolean' ? value : value === 'true';
}

// Get the value out of storage on load.
content.set(trueOrTrue(localStorage.getItem('hasData')));

// Anytime the store changes, update the local storage value.
content.subscribe((value) => {
	console.log('hasData', value, trueOrTrue(value));
	value = trueOrTrue(value);
	localStorage.setItem('hasData', value);
});

// db.get('outbox.json', function callback(err, result) {
//   if ( err ) {
//     console.log(err);
//     content.set(false);
//   } else {
//     console.log(result);
//     content.set(true);
//   }
// });
