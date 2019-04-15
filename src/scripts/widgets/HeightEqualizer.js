/*
	TITLE: HeightEqualizer

	DESCRIPTION: Sets equal height on a collection of DOM ELs

	VERSION: 0.2.5

	USAGE: let myHeightEqualizer = new HeightEqualizer('Element', 'Options')
		@param {jQuery Object}
		@param {Object}

	DEPENDENCIES:
		- jquery 3.x

*/

class HeightEqualizer {

	constructor($el, options = {}) {
		this.$window = $(window);
		this.initialize($el, options);
	}

	initialize($el, options) {

		this.$el = $el;
		this.options = Object.assign({
			selectorItems: '> div',
			setParentHeight: false
		}, options);

		// elements
		this.$items = this.$el.find(this.options.selectorItems);

		// properties
		this._length = this.$items.length;
		this.maxHeight = 0;

		if (this._length <= 1) {return;}

		this.calcHeight();
		this.setHeight();

		this.$window.on('resize', this.__onWindowResize.bind(this));
	}


	/**
	*	Event Handlers
	**/

	__onWindowResize(event) {
		this.resetHeight();
	}


	/**
	*	Public Methods
	**/

	calcHeight() {
		let heightCheck = 0;
		for (let i=0; i<this._length; i++) {
			//outerHeight includes height + padding + border
			heightCheck = this.$items.eq(i).outerHeight();
			if (heightCheck > this.maxHeight) {
				this.maxHeight = heightCheck;
			}
		}
	}

	setHeight() {
		this.$items.css({height: this.maxHeight});
		if (this.options.setParentHeight) {
			this.$el.css({height: this.maxHeight});
		}
	}

	unsetHeight() {
		this.$items.css({height: ''});
		if (this.options.setParentHeight) {
			this.$el.css({height: ''});
		}
	}

	resetHeight() {
		this.maxHeight = 0;
		this.unsetHeight();
		this.calcHeight();
		this.setHeight();
	}

	unInitialize() {
		this.$window.off('resize', this.__onWindowResize.bind(this));
		this.unsetHeight();
		this.$items = null;
		this.$el = null;
	}

}

export default HeightEqualizer;
