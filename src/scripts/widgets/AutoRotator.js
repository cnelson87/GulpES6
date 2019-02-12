/*
	TITLE: AutoRotator

	DESCRIPTION: Auto show / hide a list of elements

	VERSION: 0.1.2

	USAGE: let myAutoRotator = new AutoRotator('Element', 'Options')
		@param {jQuery Object}
		@param {Object}

	AUTHOR: Chris Nelson <cnelson87@gmail.com>

	DEPENDENCIES:
		- jquery 3.x
		- greensock

*/

import AppConfig from 'config/AppConfig';

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
			autoRotateInterval: AppConfig.timing.interval,
			animDuration: (AppConfig.timing.fast / 1000),
			animEasing: 'Power4.easeOut',
			customEventPrefix: 'AutoRotator'
		}, options);

		// element references
		this.$items = this.$el.children(this.options.selectorItems);

		// setup & properties
		this.lenItems = this.$items.length;
		this.rotationInterval = this.options.autoRotateInterval;
		if (this.options.initialIndex >= this.lenItems) {this.options.initialIndex = 0;}
		this.currentIndex = this.options.initialIndex;
		this.previousIndex = null;

		this.setDOM();

		$.event.trigger(`${this.options.customEventPrefix}:isInitialized`, [this.$el]);

		this.setAutoRotation = setInterval(() => {
			this.autoRotation();
		}, this.rotationInterval);

	}

	setDOM() {
		let $activeItem = $(this.$items[this.currentIndex]);

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

		this.previousIndex = this.currentIndex;
		this.currentIndex += 1;

		if (this.currentIndex === this.lenItems - 1) {
			this.currentIndex = 0;
		}

		this.updateDOM();

	}

	updateDOM() {
		let $activeItem = $(this.$items[this.currentIndex]);
		let $inactiveItem = $(this.$items[this.previousIndex]);

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
