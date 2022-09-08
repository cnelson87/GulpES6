/*
	TITLE: LoaderSpinner

	DESCRIPTION: Universal loader & spinner overlay

	USAGE: const myLoaderSpinner = new LoaderSpinner('Element', 'Options')
		@param {HTMLElement}
		@param {Object}

*/

class LoaderSpinner {

	constructor(rootEl, options = {}) {
		if (!rootEl) {
			console.warn('LoaderSpinner cannot initialize without rootEl');
			return;
		}
		this.initialize(rootEl, options);
	}

	initialize(rootEl, options) {

		this.rootEl = rootEl[0];
		this.options = Object.assign({
			overlayTemplate: '<div class="loader-spinner-overlay"></div>'
		}, options);

		// elements
		this.overlayEl = new DOMParser().parseFromString(this.options.overlayTemplate, 'text/html').querySelector('.loader-spinner-overlay');
	}

	addLoader() {
		this.rootEl.appendChild(this.overlayEl);
	}

	removeLoader() {
		this.rootEl.removeChild(this.overlayEl);
	}

	unInitialize() {
		this.removeLoader();
		this.overlayEl = null;
		this.rootEl = null;
	}

}

export default LoaderSpinner;
