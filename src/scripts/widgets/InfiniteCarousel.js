/*
	TITLE: InfiniteCarousel

	DESCRIPTION: An infinitely looping carousel widget

	VERSION: 0.4.0

	USAGE: const myCarousel = new InfiniteCarousel('Element', 'Options')
		@param {jQuery Object}
		@param {Object}

	DEPENDENCIES:
		- jquery 3.x
		- greensock

*/

import Constants from 'config/Constants';
import Events from 'config/Events';
import State from 'config/State';
import focusOnContentEl from 'utilities/focusOnContentEl';

class InfiniteCarousel {

	constructor($el, options = {}) {
		this.$window = $(window);
		this.initialize($el, options);
	}

	initialize($el, options) {
		const urlHash = location.hash.substring(1) || null;

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
			autoRotateInterval: Constants.timing.interval,
			maxAutoRotations: 5,
			animDuration: (Constants.timing.standard / 1000),
			animEasing: 'Power4.easeInOut',
			selectorFocusEls: Constants.focusableElements,
			enableTracking: false,
			customEventPrefix: 'InfiniteCarousel'
		}, options);

		// elements
		this.$navPrev = this.$el.find(this.options.selectorNavPrev);
		this.$navNext = this.$el.find(this.options.selectorNavNext);
		this.$outerMask = this.$el.find(this.options.selectorOuterMask);
		this.$innerTrack = this.$el.find(this.options.selectorInnerTrack);
		this.$panels = this.$innerTrack.find(this.options.selectorPanels);

		// properties
		this._length = this.$panels.length;
		if (this.options.initialIndex >= this._length) {this.options.initialIndex = 0;}
		this.numItemsToAnimate = this.options.numItemsToAnimate;
		/* eslint-disable no-magic-numbers */
		this.scrollAmt = -100 * this.numItemsToAnimate;
		/* eslint-enable no-magic-numbers */
		this.setAutoRotation = null;

		// state
		this.state = {
			currentIndex: this.options.initialIndex + this._length,
			previousIndex: null,
			isAnimating: false,
			currentBreakpoint: State.currentBreakpoint,
		};

		// check url hash to override currentIndex
		this.setInitialFocus = false;
		if (urlHash) {
			for (let i=0; i<this._length; i++) {
				if (this.$panels.eq(i).data('id') === urlHash) {
					this.state.currentIndex = i;
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
		const { classInitialized, selectorPanels, autoRotate, autoRotateInterval, maxAutoRotations } = this.options;
		const $activePanel = this.$panels.eq(this.state.currentIndex);

		// clone items for looping
		this.$panels.clone().appendTo(this.$innerTrack);
		this.$panels.clone().appendTo(this.$innerTrack);
		this.$panels = this.$innerTrack.find(selectorPanels);

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
			x: (this.scrollAmt * this.state.currentIndex) + '%'
		});

		// auto-rotate items
		if (autoRotate) {
			this.autoRotationCounter = this._length * maxAutoRotations;
			this.setAutoRotation = setInterval(() => {
				this.autoRotation();
			}, autoRotateInterval);
		}

		this.$el.addClass(classInitialized);

		// initial focus on content
		this.$window.on('load', () => {
			if (this.setInitialFocus) {
				this.focusOnPanel($activePanel);
			}
		});

	}

	uninitDOM() {
		const { classInitialized, classActiveItem, selectorFocusEls } = this.options;
		this.$el.removeAttr('role aria-live').removeClass(classInitialized);
		this.$navPrev.removeAttr('role tabindex');
		this.$navNext.removeAttr('role tabindex');
		this.$panels.removeAttr('role aria-hidden').removeClass(classActiveItem);
		this.$panels.find(selectorFocusEls).removeAttr('tabindex');
		this.cancelAutoRotation();
		TweenMax.set(this.$outerMask, {clearProps: 'all'});
		TweenMax.set(this.$innerTrack, {clearProps: 'all'});
	}

	_addEventListeners() {
		const self = this;

		this.$window.on(Events.BREAKPOINT_CHANGE, this.__onBreakpointChange.bind(this));

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
		this.$window.off(Events.BREAKPOINT_CHANGE, this.__onBreakpointChange.bind(this));
		this.$navPrev.off('click', this.__clickNavPrev.bind(this));
		this.$navNext.off('click', this.__clickNavNext.bind(this));
		if (this.options.enableSwipe) {
			this.$el.swipe('destroy');
		}
	}

	autoRotation() {
		this.state.previousIndex = this.state.currentIndex;
		this.state.currentIndex += this.numItemsToAnimate;
		this.updateCarousel();
		this.autoRotationCounter--;
		if (this.autoRotationCounter === 0) {
			this.cancelAutoRotation();
		}
	}


/**
*	Event Handlers
**/

	__onBreakpointChange(event, params) {
		this.state.currentBreakpoint = State.currentBreakpoint;
	}

	__clickNavPrev(event) {
		event.preventDefault();
		const { classNavDisabled } = this.options;

		if (this.state.isAnimating || this.$navPrev.hasClass(classNavDisabled)) {return;}

		this.cancelAutoRotation();

		this.state.previousIndex = this.state.currentIndex;
		this.state.currentIndex -= this.numItemsToAnimate;

		this.updateCarousel(event);

	}

	__clickNavNext(event) {
		event.preventDefault();
		const { classNavDisabled } = this.options;

		if (this.state.isAnimating || this.$navNext.hasClass(classNavDisabled)) {return;}

		this.cancelAutoRotation();

		this.state.previousIndex = this.state.currentIndex;
		this.state.currentIndex += this.numItemsToAnimate;

		this.updateCarousel(event);

	}


/**
*	Public Methods
**/

	updateCarousel(event) {
		const self = this;
		const { animDuration, animEasing, customEventPrefix } = this.options;
		let $activePanel;

		this.state.isAnimating = true;

		this.adjustPosition();
		this.deactivatePanels();
		this.activatePanels();

		$activePanel = this.$panels.eq(this.state.currentIndex);

		TweenMax.to(this.$innerTrack, animDuration, {
			x: (this.scrollAmt * this.state.currentIndex) + '%',
			// delay: 1.0,
			ease: animEasing,
			// onStart: function() {
			// 	self.deactivatePanels();
			// 	self.activatePanels();
			// },
			onComplete: function() {
				self.state.isAnimating = false;
				if (event) {
					self.focusOnPanel($activePanel);
				}
			}
		});

		$.event.trigger(`${customEventPrefix}:carouselUpdated`, {activeEl: $activePanel});

		this.fireTracking();
	}

	adjustPosition() {
		const { animDuration, adjOuterTrack } = this.options;
		let adjX = adjOuterTrack;

		if (this.state.currentIndex < this._length) {
			this.state.previousIndex += this._length;
			this.state.currentIndex += this._length;
			if (this.state.currentBreakpoint !== 'mobile') {
				TweenMax.fromTo(this.$outerMask, animDuration, {
					x: -adjX
				},{
					x: 0
				});
			}
			TweenMax.set(this.$innerTrack, {
				x: (this.scrollAmt * this.state.previousIndex) + '%'
			});
		}

		if (this.state.currentIndex > (this._length + this._length) - 1) {
			this.state.previousIndex -= this._length;
			this.state.currentIndex -= this._length;
			if (this.state.currentBreakpoint !== 'mobile') {
				TweenMax.fromTo(this.$outerMask, animDuration, {
					x: adjX
				},{
					x: 0
				});
			}
			TweenMax.set(this.$innerTrack, {
				x: (this.scrollAmt * this.state.previousIndex) + '%'
			});
		}

	}

	cancelAutoRotation() {
		if (!this.options.autoRotate) {return;}
		clearInterval(this.setAutoRotation);
		this.options.autoRotate = false;
	}

	deactivatePanels() {
		const { classActiveItem, selectorFocusEls } = this.options;
		this.$panels.removeClass(classActiveItem).attr({'aria-hidden': 'true'});
		this.$panels.find(selectorFocusEls).attr({'tabindex': '-1'});
	}

	activatePanels() {
		const { classActiveItem, selectorFocusEls } = this.options;
		const $activePanel = this.$panels.eq(this.state.currentIndex);
		const $activeClonePanel1 = this.$panels.eq(this.state.currentIndex - this._length);
		const $activeClonePanel2 = this.$panels.eq(this.state.currentIndex + this._length);

		$activePanel.addClass(classActiveItem).attr({'aria-hidden': 'false'});
		$activePanel.find(selectorFocusEls).attr({'tabindex': '0'});
		$activeClonePanel1.addClass(classActiveItem);
		$activeClonePanel2.addClass(classActiveItem);

	}

	focusOnPanel($panel) {
		focusOnContentEl($panel);
	}

	fireTracking() {
		if (!this.options.enableTracking) {return;}
		const $activePanel = this.$panels.eq(this.state.currentIndex);
		$.event.trigger(Events.TRACKING_STATE, [$activePanel]);
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
