/*
	TITLE: Widget

	DESCRIPTION: Widget widget

	USAGE: const myWidget = new Widget('Element', 'Options')
		@param {HTMLElement}
		@param {Object}

*/

class Widget {

	constructor(rootEl, options = {}) {
		if (!rootEl) {
			console.warn('Widget cannot initialize without rootEl');
			return;
		}
		this.initialize(rootEl, options);
	}

	initialize(rootEl, options) {

		// defaults
		this.rootEl = rootEl;
		this.options = Object.assign({
			selectorChilds: '.widget--child',
			classActive: 'is-active',
			classDisabled: 'is-disabled',
			classInitialized: 'is-initialized',
			customEventPrefix: 'Widget'
		}, options);

		// elements
		this.childEls = this.rootEl.querySelectorAll(this.options.selectorChilds);

		// properties
		this._length = this.childEls.length;

		// state
		this.state = {
			something: true,
		};

		this.initDOM();

		this._addEventListeners();

		window.dispatchEvent(new CustomEvent(`${this.options.customEventPrefix}:isInitialized`, {detail: {rootEl: this.rootEl}} ));
	}

	initDOM() {

		this.rootEl.classList.add(this.options.classInitialized);
	}

	uninitDOM() {

		this.rootEl.classList.remove(this.options.classInitialized);
	}

	_addEventListeners() {

	}

	_removeEventListeners() {

	}

	unInitialize() {
		this._removeEventListeners();
		this.uninitDOM();
		window.dispatchEvent(new CustomEvent(`${this.options.customEventPrefix}:unInitialized`, {detail: {rootEl: this.rootEl}} ));
	}

}

export default Widget;
