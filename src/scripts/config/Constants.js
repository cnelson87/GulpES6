/**
 * @module Constants
 * @description Defines application constants
 */

const Constants = {

	siteUrl: window.location.origin,
	isAndroid: /android/i.test(navigator.userAgent),
	isIOS: /iPad|iPhone|iPod/i.test(navigator.userAgent),
	hasFormValidation: typeof document.createElement('input').checkValidity === 'function',
	hasTouch: Boolean('ontouchstart' in window || navigator.maxTouchPoints || navigator.msMaxTouchPoints),

	// standard HTML content elements
	contentElements: 'h1, h2, h3, h4, h5, h6, p, ul, ol, dl, table, a, button',

	// elements that are natively able to receive focus
	focusableElements: 'a, button, input, select, textarea, iframe, audio, video',

	// breakpoints used throughout
	mediaQueries: {
		tablet: 768,
		desktop: 1080,
	},

	// timing used throughout
	timing: {
		fast: 200,
		standard: 400,
		slow: 800,
		interval: 8000,
	},

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
		down: 40,
	},

	// ajax endpoints
	urls: {
		fibonacci: '/_assets/data/promises/fibonacci.json',
		primes: '/_assets/data/promises/primes.json',
		triangle: '/_assets/data/promises/triangle.json',
		videosPlaylistLIVE: 'https://www.googleapis.com/youtube/v3/playlistItems',
		videosPlaylistDEV: '/_assets/data/videos/playlist.json',
		homepageContent: '/_assets/data/homepage/content.json',
	},

	youtubePlaylistId: 'PLyYlLs02rgBYRWBzYpoHz7m2SE8mEZ68w',

	// 'cnelson87@gmail.com' key
	youtubeApiKey: 'AIzaSyArsiakfiHbXRsHYv57Hti8dnzEJHRHV8Y',

};

export default Constants;
