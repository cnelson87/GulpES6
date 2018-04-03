/*
	TITLE: LoaderSpinner

	DESCRIPTION: Universal Ajax loader & spinner overlay

	VERSION: 0.2.4

	USAGE: let myLoaderSpinner = new LoaderSpinner('Element', 'Options')
		@param {jQuery Object}
		@param {Object}

	AUTHOR: Chris Nelson <cnelson87@gmail.com>

	DEPENDENCIES:
		- jquery 3.x

*/

class LoaderSpinner {

	constructor($el, options = {}) {
		this.initialize($el, options);
	}

	initialize($el, options) {

		this.$el = $el;
		this.options = Object.assign({
			overlayTemplate: '<div class="loader-spinner-overlay"></div>'
		}, options);

		// element references
		this.$elOverlay = $(this.options.overlayTemplate);

	}

	addLoader() {
		let delay = 10;
		this.$el.append(this.$elOverlay);
		setTimeout(() => {
			//spinner gif gets 'stuck' and needs a click
			this.$elOverlay.click();
		}, delay);
	}

	removeLoader() {
		this.$elOverlay.remove();
	}

	unInitialize() {
		this.$elOverlay.remove();
		this.$elOverlay = null;
		this.$el = null;
	}

}

export default LoaderSpinner;
