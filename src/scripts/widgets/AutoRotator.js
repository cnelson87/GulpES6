/*
	TITLE: AutoRotator

	DESCRIPTION: Auto show / hide a list of elements

	VERSION: 0.2.0

	USAGE: let myAutoRotator = new AutoRotator('Element', 'Options')
		@param {jQuery Object}
		@param {Object}

	DEPENDENCIES:
		- jquery 3.x
		- greensock

*/

import Constants from 'config/Constants';

class AutoRotator {

	constructor($el, options = {}) {
		this.initialize($el, options);
	}

	initialize($el, options) {

		// defaults
		this.$el = $el;
		this.options = Object.assign({
			initialIndex: 0,
			selectorItems: 'article',
			autoRotateInterval: Constants.timing.interval,
			animDuration: (Constants.timing.fast / 1000),
			animEasing: 'Power4.easeOut',
			customEventPrefix: 'AutoRotator'
		}, options);

		// elements
		this.$items = this.$el.children(this.options.selectorItems);

		// properties
		this._length = this.$items.length;
		if (this.options.initialIndex >= this._length) {this.options.initialIndex = 0;}
		this.rotationInterval = this.options.autoRotateInterval;

		// state
		this.state = {
			currentIndex: this.options.initialIndex,
			previousIndex: null,
		};

		this.setDOM();

		$.event.trigger(`${this.options.customEventPrefix}:isInitialized`, [this.$el]);

		this.setAutoRotation = setInterval(() => {
			this.autoRotation();
		}, this.rotationInterval);

	}

	setDOM() {
		let $activeItem = $(this.$items[this.state.currentIndex]);

		TweenMax.set(this.$items, {
			left: '100%',
			zIndex: 1
		});

		TweenMax.set($activeItem, {
			left: '0',
			zIndex: 9
		});

	}

	autoRotation() {

		this.state.previousIndex = this.state.currentIndex;
		this.state.currentIndex++;

		if (this.state.currentIndex === this._length - 1) {
			this.state.currentIndex = 0;
		}

		this.updateDOM();

	}

	updateDOM() {
		let $activeItem = this.$items.eq(this.state.currentIndex);
		let $inactiveItem = this.$items.eq(this.state.previousIndex);

		TweenMax.set($inactiveItem, {
			zIndex: 8
		});

		TweenMax.set($activeItem, {
			zIndex: 9
		});

		TweenMax.to($activeItem, this.options.animDuration, {
			left: 0,
			ease: this.options.animEasing,
			onComplete: function() {
				TweenMax.set($inactiveItem, {
					left: '100%',
					zIndex: 1
				});
			}
		});

	}

}

export default AutoRotator;
