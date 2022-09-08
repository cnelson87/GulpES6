/*
	TITLE: HeightEqualizer

	DESCRIPTION: Sets equal height on a collection of DOM ELs

	USAGE: const myHeightEqualizer = new HeightEqualizer('Element', 'Options')
		@param {HTMLElement}
		@param {Object}

*/

class HeightEqualizer {

	constructor(rootEl, options = {}) {
		if (!rootEl) {
			console.warn('HeightEqualizer cannot initialize without rootEl');
			return;
		}
		this.initialize(rootEl, options);
	}

	initialize(rootEl, options) {

		this.rootEl = rootEl;
		this.options = Object.assign({
			selectorItems: '> div',
			setParentHeight: false
		}, options);

		// elements
		this.itemEls = this.rootEl.querySelectorAll(this.options.selectorItems);

		// properties
		this._length = this.itemEls.length;
		this.maxHeight = 0;
		if (this._length <= 1) { return; }

		this.calcHeight();
		this.setHeight();

		window.addEventListener('resize', this.resetHeight.bind(this));
	}


	/**
	*	Public Methods
	**/

	calcHeight() {
		let heightCheck = 0;
		this.itemEls.forEach((itemEl) => {
			if (itemEl.style.display === 'none') {
				itemEl.style.display = '';
				heightCheck = itemEl.offsetHeight;
				itemEl.style.display = 'none';
			} else {
				heightCheck = itemEl.offsetHeight;
			}
			if (heightCheck > this.maxHeight) {
				this.maxHeight = heightCheck;
			}
		});
	}

	setHeight() {
		this.itemEls.forEach((itemEl) => {
			itemEl.style.height = this.maxHeight + 'px';
		});
		if (this.options.setParentHeight) {
			this.rootEl.style.height = this.maxHeight + 'px';
		}
	}

	unsetHeight() {
		this.itemEls.forEach((itemEl) => {
			itemEl.style.height = 'auto';
		});
		if (this.options.setParentHeight) {
			this.rootEl.style.height = 'auto';
		}
	}

	resetHeight() {
		this.maxHeight = 0;
		this.unsetHeight();
		this.calcHeight();
		this.setHeight();
	}

	unInitialize() {
		window.removeEventListener('resize', this.resetHeight.bind(this));
		this.unsetHeight();
	}

}

export default HeightEqualizer;
