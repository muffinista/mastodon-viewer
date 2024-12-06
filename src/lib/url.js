// https://github.com/bluwy/svelte-url

import { derived, writable } from 'svelte/store';

const href = writable(window.location.href);

const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

const updateHref = () => href.set(window.location.href);

history.pushState = function () {
	originalPushState.apply(this, arguments);
	updateHref();
};

history.replaceState = function () {
	originalReplaceState.apply(this, arguments);
	updateHref();
};

window.addEventListener('popstate', updateHref);
window.addEventListener('hashchange', updateHref);

export const url = {
	subscribe: derived(href, ($href) => new URL($href)).subscribe
};
