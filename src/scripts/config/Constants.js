/**
 * @module Constants
 * @description Defines application constants
 */

if (!window.location.origin) {
	window.location.origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
}

const Constants = {

	siteUrl: window.location.origin,
	isIE10: navigator.userAgent.indexOf('MSIE 10') !== -1,
	isIE11: (navigator.userAgent.indexOf('Windows NT') !== -1 && navigator.userAgent.indexOf('rv:11') !== -1),
	isEdge: /Edge/.test(navigator.userAgent),
	isAndroid: /android/i.test(navigator.userAgent),
	isIOS: /iPad|iPhone|iPod/i.test(navigator.userAgent),
	hasFormValidation: typeof document.createElement('input').checkValidity === 'function',
	hasTouch: Boolean('ontouchstart' in window || navigator.maxTouchPoints || navigator.msMaxTouchPoints),

	// standard HTML content elements
	contentElements: 'h1, h2, h3, h4, h5, h6, p, ul, ol, dl, table, a, button',

	// elements that are natively able to receive focus
	focusableElements: 'a, button, input, select, textarea, iframe, audio, video',

	// keyboard key codes
	keys: {
		enter: 13,
		escape: 27,
		space: 32,
		end: 35,
		home: 36,
		left: 37,
		up: 38,
		right: 39,
		down: 40
	},

	// timing used throughout
	timing: {
		fast: 200,
		standard: 400,
		slow: 800,
		interval: 8000
	},

	// ajax endpoints
	urls: {
		fibonacci: '/_data/promises/fibonacci.json',
		primes: '/_data/promises/primes.json',
		sevens: '/_data/promises/sevens.json',
		videosPlaylistLIVE: 'https://www.googleapis.com/youtube/v3/playlistItems',
		videosPlaylistDEV: '/_data/videos/playlist.json',
		homepageContent: '/_data/homepage/content.json'
	},

	// Starbucks Members playlist
	youtubePlaylistId: 'PLLt7Vrrx9E2CZTd0A3Prj0CBGGE0dcdDe',

	// my 'chrisn.wearepop@gmail.com' key
	youtubeApiKey: 'AIzaSyDpNKX16BmckoJ14akwMxk0mHuJWgvNuBI',

};

export default Constants;
