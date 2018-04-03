/*
	TITLE: Widget

	DESCRIPTION: Widget widget

	VERSION: 0.1.0

	USAGE: let myWidget = new Widget('Element', 'Options')
		@param {jQuery Object}
		@param {Object}

	AUTHOR: Chris Nelson <cnelson87@gmail.com>

	DEPENDENCIES:
		- jquery 3.x

*/

class Widget {

	constructor($el, options = {}) {
		this.initialize($el, options);
	}

	initialize($el, options) {

		// defaults
		this.$el = $el;
		this.options = Object.assign({
			selectorFoobars: '.widget--foobar',
			selectorThings: '.widget--thing',
			classActive: 'is-active',
			classDisabled: 'is-disabled',
			classInitialized: 'is-initialized',
			customEventPrefix: 'Widget'
		}, options);

		// element references
		this.$foobars = this.$el.find(this.options.selectorFoobars);
		this.$things = this.$el.find(this.options.selectorThings);

		// setup & properties
		this._length = this.$things.length;

		this.initDOM();

		this._addEventListeners();

		$.event.trigger(`${this.options.customEventPrefix}:isInitialized`, [this.$el]);

	}

	initDOM() {


		this.$el.addClass(this.options.classInitialized);
	}

	uninitDOM() {


		this.$el.removeClass(this.options.classInitialized);
	}

	_addEventListeners() {

	}

	_removeEventListeners() {

	}

	unInitialize() {
		this._removeEventListeners();
		this.uninitDOM();
		this.$el = null;
		this.$foobars = null;
		this.$things = null;
		$.event.trigger(`${this.options.customEventPrefix}:unInitialized`);
	}

}

export default Widget;
