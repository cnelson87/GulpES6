/*
	TITLE: ResponsiveCarousel

	DESCRIPTION: A carousel widget that responds to mobile, tablet, and desaktop media queries

	VERSION: 0.5.0

	USAGE: const myCarousel = new ResponsiveCarousel('Element', 'Options')
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

const PERCENT = 100;

class ResponsiveCarousel {

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
			numVisibleItemsMobile: 1,
			numItemsToAnimateMobile: 1,
			numVisibleItemsTablet: 1,
			numItemsToAnimateTablet: 1,
			numVisibleItemsDesktop: 1,
			numItemsToAnimateDesktop: 1,
			enableSwipe: true,
			loopEndToEnd: false,
			staggerActiveItems: false,
			selectorNavPrev: '.nav-prev',
			selectorNavNext: '.nav-next',
			selectorInnerTrack: '.carousel--inner-track',
			selectorPanels: '.carousel--panel',
			classActiveItem: 'is-active',
			classNavDisabled: 'is-disabled',
			classInitialized: 'is-initialized',
			autoRotate: false,
			autoRotateInterval: Constants.timing.interval,
			maxAutoRotations: 5,
			animDuration: (Constants.timing.standard / 1000),
			animEasing: 'Power4.easeInOut',
			selectorFocusEls: Constants.focusableElements,
			enableTracking: false,
			customEventPrefix: 'ResponsiveCarousel'
		}, options);

		// elements
		this.$navPrev = this.$el.find(this.options.selectorNavPrev);
		this.$navNext = this.$el.find(this.options.selectorNavNext);
		this.$innerTrack = this.$el.find(this.options.selectorInnerTrack);
		this.$panels = this.$innerTrack.children(this.options.selectorPanels);

		// properties
		this._length = this.$panels.length;
		if (this.options.initialIndex >= this._length) {this.options.initialIndex = 0;}
		this.lastIndex = null;
		this.itemWidth = null;
		this.scrollAmt = null;
		this.trackWidth = null;
		this.numVisibleItems = null;
		this.numItemsToAnimate = null;

		// state
		this.state = {
			currentIndex: this.options.initialIndex,
			isAnimating: false,
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
		const $activePanel = this.$panels.eq(this.state.currentIndex);

		this.$el.attr({'role': 'tablist', 'aria-live': 'polite'});
		this.$navPrev.attr({'role': 'button', 'tabindex': '0'});
		this.$navNext.attr({'role': 'button', 'tabindex': '0'});
		this.$panels.attr({'role': 'tabpanel', 'aria-hidden': 'true'});

		this.setOptions();

		this.setDOM();

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

	setOptions() {
		// console.log(State.currentBreakpoint);

		switch(State.currentBreakpoint) {
			case 'mobile':
				this.numVisibleItems = this.options.numVisibleItemsMobile;
				this.numItemsToAnimate = this.options.numItemsToAnimateMobile;
				break;
			case 'tablet':
				this.numVisibleItems = this.options.numVisibleItemsTablet;
				this.numItemsToAnimate = this.options.numItemsToAnimateTablet;
				break;
			case 'desktop':
				this.numVisibleItems = this.options.numVisibleItemsDesktop;
				this.numItemsToAnimate = this.options.numItemsToAnimateDesktop;
				break;
			default:
				console.error('ERROR: Invalid Breakpoint');
		}

		this.lastIndex = this._length - this.numVisibleItems;
		if (this.state.currentIndex > this.lastIndex) {this.state.currentIndex = this.lastIndex;}
		this.itemWidth = PERCENT / this._length;
		this.scrollAmt = (PERCENT / this.numVisibleItems) * -1;
		this.trackWidth = (1 / this.numVisibleItems) * (this._length * PERCENT);

	}

	setDOM() {
		const itemWidth = this.itemWidth + '%';
		const trackWidth = this.trackWidth + '%';
		const leftPos = (this.scrollAmt * this.state.currentIndex) + '%';

		// disable nav links if not enough visible items
		this.updateNav();
		if (this._length <= this.numVisibleItems) {
			this.$navPrev.addClass(this.options.classNavDisabled).attr({'tabindex': '-1'});
			this.$navNext.addClass(this.options.classNavDisabled).attr({'tabindex': '-1'});
		}

		// adjust initial position
		this.$panels.css({width: itemWidth});
		TweenMax.set(this.$innerTrack, {
			width: trackWidth,
			left: leftPos
		});

		this.deactivateItems();
		this.activateItems();

	}

	uninitDOM() {
		const { classInitialized, classActiveItem, selectorFocusEls } = this.options;
		this.$el.removeAttr('role aria-live').removeClass(classInitialized);
		this.$navPrev.removeAttr('role tabindex');
		this.$navNext.removeAttr('role tabindex');
		this.$panels.removeAttr('role aria-hidden').removeClass(classActiveItem);
		this.$panels.find(selectorFocusEls).removeAttr('tabindex');
		this.cancelAutoRotation();
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

		if (this.state.currentIndex === this.lastIndex) {
			this.state.currentIndex = 0;
		}
		else {
			this.state.currentIndex += this.numItemsToAnimate;
			if (this.state.currentIndex > this.lastIndex) {this.state.currentIndex = this.lastIndex;}
		}

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
		// console.log(params);
		this.setOptions();
		this.setDOM();
	}

	__clickNavPrev(event) {
		event.preventDefault();
		const { classNavDisabled, loopEndToEnd } = this.options;

		if (this.state.isAnimating || this.$navPrev.hasClass(classNavDisabled)) {return;}

		this.cancelAutoRotation();

		if (loopEndToEnd && this.state.currentIndex === 0) {
			this.state.currentIndex = this.lastIndex;
		} else {
			this.state.currentIndex -= this.numItemsToAnimate;
			if (this.state.currentIndex < 0) {this.state.currentIndex = 0;}
		}

		this.updateCarousel(event);

	}

	__clickNavNext(event) {
		event.preventDefault();
		const { classNavDisabled, loopEndToEnd } = this.options;

		if (this.state.isAnimating || this.$navNext.hasClass(classNavDisabled)) {return;}

		this.cancelAutoRotation();

		if (loopEndToEnd && this.state.currentIndex === this.lastIndex) {
			this.state.currentIndex = 0;
		} else {
			this.state.currentIndex += this.numItemsToAnimate;
			if (this.state.currentIndex > this.lastIndex) {this.state.currentIndex = this.lastIndex;}
		}

		this.updateCarousel(event);

	}


/**
*	Public Methods
**/

	updateCarousel(event) {
		const self = this;
		const { customEventPrefix, animDuration, animEasing } = this.options;
		const $activePanel = this.$panels.eq(this.state.currentIndex);
		const leftPos = (this.scrollAmt * this.state.currentIndex) + '%';

		this.state.isAnimating = true;

		this.deactivateItems();

		this.updateNav();

		$.event.trigger(`${customEventPrefix}:carouselPreUpdate`, {activePanel: $activePanel});

		TweenMax.to(this.$innerTrack, animDuration, {
			left: leftPos,
			ease: animEasing,
			onUpdate: function() {
				$.event.trigger(`${customEventPrefix}:carouselOpening`, {activePanel: $activePanel});
			},
			onComplete: function() {
				self.state.isAnimating = false;
				self.activateItems();
				if (!!event) {
					self.focusOnPanel($activePanel);
				}
				$.event.trigger(`${customEventPrefix}:carouselUpdated`, {activePanel: $activePanel});
			}
		});

		this.fireTracking();
	}

	updateNav() {
		const { loopEndToEnd, classNavDisabled } = this.options;

		if (!loopEndToEnd) {
			this.$navPrev.removeClass(classNavDisabled).attr({'tabindex': '0'});
			this.$navNext.removeClass(classNavDisabled).attr({'tabindex': '0'});

			if (this.state.currentIndex <= 0) {
				this.$navPrev.addClass(classNavDisabled).attr({'tabindex': '-1'});
			}
			if (this.state.currentIndex >= this.lastIndex) {
				this.$navNext.addClass(classNavDisabled).attr({'tabindex': '-1'});
			}

		}
	}

	cancelAutoRotation() {
		if (!this.options.autoRotate) {return;}
		clearInterval(this.setAutoRotation);
		this.options.autoRotate = false;
	}

	deactivateItems() {
		const { classActiveItem, selectorFocusEls } = this.options;
		this.$panels.removeClass(classActiveItem).attr({'aria-hidden': 'true'});
		this.$panels.find(selectorFocusEls).attr({'tabindex': '-1'});
	}

	activateItems() {
		const { staggerActiveItems, selectorFocusEls, classActiveItem } = this.options;
		const first = this.state.currentIndex;
		const last = this.state.currentIndex + this.numVisibleItems;
		const $activeItems = this.$panels.slice(first, last);
		let delay = 100;

		if (staggerActiveItems) {
			//activate all current items incrementally
			$activeItems.each(function(index) {
				let $item = $(this);
				$item.delay(delay*index).queue(function() {
					$item.find(selectorFocusEls).attr({'tabindex': '0'});
					$item.addClass(classActiveItem).attr({'aria-hidden': 'false'}).dequeue();
				});
			});

		}
		else {
			//activate all current items at once
			$activeItems.addClass(classActiveItem).attr({'aria-hidden': 'false'});
			$activeItems.find(selectorFocusEls).attr({'tabindex': '0'});
		}

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
		this.$innerTrack = null;
		this.$panels = null;
		$.event.trigger(`${this.options.customEventPrefix}:unInitialized`);
	}

}

export default ResponsiveCarousel;
