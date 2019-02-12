/*
	TITLE: InfiniteCarousel

	DESCRIPTION: An infinitely looping carousel widget

	VERSION: 0.2.4

	USAGE: let myCarousel = new InfiniteCarousel('Element', 'Options')
		@param {jQuery Object}
		@param {Object}

	AUTHOR: Chris Nelson <cnelson87@gmail.com>

	DEPENDENCIES:
		- jquery 3.x
		- greensock

*/

import AppConfig from 'config/AppConfig';
import AppEvents from 'config/AppEvents';
import AppState from 'config/AppState';
import focusOnContentEl from 'utilities/focusOnContentEl';

class InfiniteCarousel {

	constructor($el, options = {}) {
		this.$window = $(window);
		this.initialize($el, options);
	}

	initialize($el, options) {
		let urlHash = location.hash.substring(1) || null;

		// defaults
		this.$el = $el;
		this.options = Object.assign({
			initialIndex: 0,
			numItemsToAnimate: 1,
			selectorNavPrev: '.nav-prev',
			selectorNavNext: '.nav-next',
			selectorOuterMask: '.carousel--outer-mask',
			selectorInnerTrack: '.carousel--inner-track',
			selectorPanels: '.carousel--panel',
			classActiveItem: 'is-active',
			classNavDisabled: 'is-disabled',
			classInitialized: 'is-initialized',
			adjOuterTrack: 80,
			enableSwipe: true,
			autoRotate: false,
			autoRotateInterval: AppConfig.timing.interval,
			maxAutoRotations: 5,
			animDuration: (AppConfig.timing.standard / 1000),
			animEasing: 'Power4.easeInOut',
			selectorFocusEls: AppConfig.focusableElements,
			enableTracking: false,
			customEventPrefix: 'InfiniteCarousel'
		}, options);

		// element references
		this.$navPrev = this.$el.find(this.options.selectorNavPrev);
		this.$navNext = this.$el.find(this.options.selectorNavNext);
		this.$outerMask = this.$el.find(this.options.selectorOuterMask);
		this.$innerTrack = this.$el.find(this.options.selectorInnerTrack);
		this.$panels = this.$innerTrack.find(this.options.selectorPanels);

		// setup & properties
		this._length = this.$panels.length;
		this.currentIndex = this.options.initialIndex + this._length;
		this.previousIndex = null;
		this.numItemsToAnimate = this.options.numItemsToAnimate;
		/* eslint-disable no-magic-numbers */
		this.scrollAmt = -100 * this.numItemsToAnimate;
		/* eslint-enable no-magic-numbers */
		this.setAutoRotation = null;
		this.isAnimating = false;
		this.currentBreakpoint = AppState.currentBreakpoint;

		// check url hash to override currentIndex
		this.setInitialFocus = false;
		if (urlHash) {
			for (let i=0; i<this._length; i++) {
				if (this.$panels.eq(i).data('id') === urlHash) {
					this.currentIndex = i;
					this.setInitialFocus = true;
					break;
				}
			}
		}

		this.initDOM();

		this._addEventListeners();

		$.event.trigger(`${this.options.customEventPrefix}:isInitialized`, [this.$el]);

	}


/**
*	Private Methods
**/

	initDOM() {
		let $activePanel = this.$panels.eq(this.currentIndex);

		// clone items for looping
		this.$panels.clone().appendTo(this.$innerTrack);
		this.$panels.clone().appendTo(this.$innerTrack);
		this.$panels = this.$innerTrack.find(this.options.selectorPanels);

		// add aria attributes
		this.$el.attr({'role': 'tablist', 'aria-live': 'polite'});
		this.$navPrev.attr({'role': 'button', 'tabindex': '0'});
		this.$navNext.attr({'role': 'button', 'tabindex': '0'});
		this.$panels.attr({'role': 'tabpanel', 'aria-hidden': 'true'});

		this.deactivatePanels();
		this.activatePanels();

		TweenMax.set(this.$outerMask, {
			x: 0
		});
		TweenMax.set(this.$innerTrack, {
			x: (this.scrollAmt * this.currentIndex) + '%'
		});

		// auto-rotate items
		if (this.options.autoRotate) {
			this.autoRotationCounter = this._length * this.options.maxAutoRotations;
			this.setAutoRotation = setInterval(() => {
				this.autoRotation();
			}, this.options.autoRotateInterval);
		}

		this.$el.addClass(this.options.classInitialized);

		// initial focus on content
		this.$window.on('load', () => {
			if (this.setInitialFocus) {
				this.focusOnPanel($activePanel);
			}
		});

	}

	uninitDOM() {
		this.$el.removeAttr('role aria-live').removeClass(this.options.classInitialized);
		this.$navPrev.removeAttr('role tabindex');
		this.$navNext.removeAttr('role tabindex');
		this.$panels.removeAttr('role aria-hidden').removeClass(this.options.classActiveItem);
		this.$panels.find(this.options.selectorFocusEls).removeAttr('tabindex');
		TweenMax.set(this.$outerMask, {
			x: ''
		});
		TweenMax.set(this.$innerTrack, {
			x: ''
		});
		if (this.options.autoRotate) {
			clearInterval(this.setAutoRotation);
		}
	}

	_addEventListeners() {
		let self = this;

		this.$window.on(AppEvents.BREAKPOINT_CHANGE, this.__onBreakpointChange.bind(this));

		this.$navPrev.on('click', this.__clickNavPrev.bind(this));

		this.$navNext.on('click', this.__clickNavNext.bind(this));

		if (this.options.enableSwipe) {
			this.$el.swipe({
				fingers: 'all',
				excludedElements: '.noSwipe',
				threshold: 50,
				triggerOnTouchEnd: false, // triggers on threshold
				swipeLeft: function(event) {
					self.$navNext.click();
				},
				swipeRight: function(event) {
					self.$navPrev.click();
				},
				allowPageScroll: 'vertical'
			});
		}

	}

	_removeEventListeners() {
		this.$window.off(AppEvents.BREAKPOINT_CHANGE, this.__onBreakpointChange.bind(this));
		this.$navPrev.off('click', this.__clickNavPrev.bind(this));
		this.$navNext.off('click', this.__clickNavNext.bind(this));
		if (this.options.enableSwipe) {
			this.$el.swipe('destroy');
		}
	}

	autoRotation() {
		this.previousIndex = this.currentIndex;
		this.currentIndex += this.numItemsToAnimate;
		this.updateCarousel();
		this.autoRotationCounter--;
		if (this.autoRotationCounter === 0) {
			clearInterval(this.setAutoRotation);
			this.options.autoRotate = false;
		}
	}


/**
*	Event Handlers
**/

	__onBreakpointChange(event, params) {
		this.currentBreakpoint = AppState.currentBreakpoint;
	}

	__clickNavPrev(event) {
		event.preventDefault();

		if (this.isAnimating || this.$navPrev.hasClass(this.options.classNavDisabled)) {return;}

		if (this.options.autoRotate) {
			clearInterval(this.setAutoRotation);
			this.options.autoRotate = false;
		}

		this.previousIndex = this.currentIndex;
		this.currentIndex -= this.numItemsToAnimate;

		this.updateCarousel(event);

	}

	__clickNavNext(event) {
		event.preventDefault();

		if (this.isAnimating || this.$navNext.hasClass(this.options.classNavDisabled)) {return;}

		if (this.options.autoRotate) {
			clearInterval(this.setAutoRotation);
			this.options.autoRotate = false;
		}

		this.previousIndex = this.currentIndex;
		this.currentIndex += this.numItemsToAnimate;

		this.updateCarousel(event);

	}


/**
*	Public Methods
**/

	updateCarousel(event) {
		let self = this;
		let $activePanel;

		this.isAnimating = true;

		this.adjustPosition();
		this.deactivatePanels();
		this.activatePanels();

		$activePanel = this.$panels.eq(this.currentIndex);

		TweenMax.to(this.$innerTrack, this.options.animDuration, {
			x: (this.scrollAmt * this.currentIndex) + '%',
			// delay: 1.0,
			ease: this.options.animEasing,
			// onStart: function() {
			// 	self.deactivatePanels();
			// 	self.activatePanels();
			// },
			onComplete: function() {
				self.isAnimating = false;
				if (!!event) {
					self.focusOnPanel($activePanel);
				}
			}
		});

		$.event.trigger(`${this.options.customEventPrefix}:carouselUpdated`, {activeEl: $activePanel});

		this.fireTracking();
	}

	adjustPosition() {
		let adjX = this.options.adjOuterTrack;

		if (this.currentIndex < this._length) {
			this.previousIndex += this._length;
			this.currentIndex += this._length;
			if (this.currentBreakpoint !== 'mobile') {
				TweenMax.fromTo(this.$outerMask, this.options.animDuration, {
					x: -adjX
				},{
					x: 0
				});
			}
			TweenMax.set(this.$innerTrack, {
				x: (this.scrollAmt * this.previousIndex) + '%'
			});
		}

		if (this.currentIndex > (this._length + this._length) - 1) {
			this.previousIndex -= this._length;
			this.currentIndex -= this._length;
			if (this.currentBreakpoint !== 'mobile') {
				TweenMax.fromTo(this.$outerMask, this.options.animDuration, {
					x: adjX
				},{
					x: 0
				});
			}
			TweenMax.set(this.$innerTrack, {
				x: (this.scrollAmt * this.previousIndex) + '%'
			});
		}

	}

	deactivatePanels() {
		this.$panels.removeClass(this.options.classActiveItem).attr({'aria-hidden':'true'});
		this.$panels.find(this.options.selectorFocusEls).attr({'tabindex':'-1'});
	}

	activatePanels() {
		var $activePanel = this.$panels.eq(this.currentIndex);
		var $activeClonePanel1 = this.$panels.eq(this.currentIndex - this._length);
		var $activeClonePanel2 = this.$panels.eq(this.currentIndex + this._length);

		$activePanel.addClass(this.options.classActiveItem).attr({'aria-hidden':'false'});
		$activePanel.find(this.options.selectorFocusEls).attr({'tabindex':'0'});
		$activeClonePanel1.addClass(this.options.classActiveItem);
		$activeClonePanel2.addClass(this.options.classActiveItem);

	}

	focusOnPanel($panel) {
		focusOnContentEl($panel);
	}

	fireTracking() {
		if (!this.options.enableTracking) {return;}
		let $activePanel = this.$panels.eq(this.currentIndex);
		$.event.trigger(AppEvents.TRACKING_STATE, [$activePanel]);
	}

	unInitialize() {
		this._removeEventListeners();
		this.uninitDOM();
		this.$el = null;
		this.$navPrev = null;
		this.$navNext = null;
		this.$outerMask = null;
		this.$innerTrack = null;
		this.$panels = null;
		$.event.trigger(`${this.options.customEventPrefix}:unInitialized`);
	}

}

export default InfiniteCarousel;
