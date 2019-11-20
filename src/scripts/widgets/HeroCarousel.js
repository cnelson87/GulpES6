/*
	TITLE: HeroCarousel

	DESCRIPTION: An infinitely looping hero carousel widget

	VERSION: 0.1.0

	USAGE: const myCarousel = new HeroCarousel('Element', 'Options')
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

class HeroCarousel {

	constructor($el, options = {}) {
		this.$window = $(window);
		this.initialize($el, options);
	}

	initialize($el, options) {

		// defaults
		this.$el = $el;
		this.options = Object.assign({
			initialIndex: 0,
			selectorNavPrev: '.nav-prev',
			selectorNavNext: '.nav-next',
			selectorTabs: '.carousel--tabnav a',
			selectorOuterMask: '.carousel--outer-mask',
			selectorInnerTrack: '.carousel--inner-track',
			selectorPanels: '.carousel--panel',
			classActivePanel: 'is-active',
			classActiveTab: 'is-active',
			classNavDisabled: 'is-disabled',
			classInitialized: 'is-initialized',
			selectedText: 'currently selected',
			enableSwipe: true,
			autoRotate: false,
			autoRotateInterval: Constants.timing.interval,
			maxAutoRotations: 5,
			animDuration: (Constants.timing.standard / 1000),
			animEasing: 'Power4.easeInOut',
			selectorFocusEls: Constants.focusableElements,
			enableTracking: false,
			customEventPrefix: 'HeroCarousel'
		}, options);

		// elements
		this.$navPrev = this.$el.find(this.options.selectorNavPrev);
		this.$navNext = this.$el.find(this.options.selectorNavNext);
		this.$tabs = this.$el.find(this.options.selectorTabs);
		this.$outerMask = this.$el.find(this.options.selectorOuterMask);
		this.$innerTrack = this.$el.find(this.options.selectorInnerTrack);
		this.$panels = this.$innerTrack.find(this.options.selectorPanels);

		// properties
		this._length = this.$panels.length;
		if (this.options.initialIndex >= this._length) {this.options.initialIndex = 0;}
		this.selectedLabel = `<span class="sr-only selected-text"> - ${this.options.selectedText}</span>`;
		this.scrollAmt = -PERCENT;
		this.setAutoRotation = null;

		// state
		this.state = {
			currentIndex: this.options.initialIndex + this._length,
			previousIndex: null,
			isAnimating: false,
			currentBreakpoint: State.currentBreakpoint,
		};

		this.initDOM();

		this._addEventListeners();

		$.event.trigger(`${this.options.customEventPrefix}:isInitialized`, [this.$el]);

	}


/**
*	Private Methods
**/

	initDOM() {
		const { classInitialized, selectorPanels, autoRotate, autoRotateInterval, maxAutoRotations } = this.options;
		const $activeTab = this.$tabs.eq(this.state.currentIndex - this._length);

		// clone panels for looping
		this.$panels.clone().appendTo(this.$innerTrack);
		this.$panels.clone().appendTo(this.$innerTrack);
		this.$panels = this.$innerTrack.find(selectorPanels);

		// add aria attributes
		this.$el.attr({'role': 'tablist', 'aria-live': 'polite'});
		this.$navPrev.attr({'role': 'button', 'tabindex': '0'});
		this.$navNext.attr({'role': 'button', 'tabindex': '0'});
		this.$panels.attr({'role': 'tabpanel', 'aria-hidden': 'true'});
		this.$tabs.attr({'role': 'tab', 'tabindex': '0', 'aria-selected': 'false'});

		this.deactivatePanels();
		this.activatePanels();
		this.activateTab($activeTab);

		TweenMax.set(this.$innerTrack, {
			left: (this.scrollAmt * this.state.currentIndex) + '%'
		});

		if (autoRotate) {
			this.autoRotationCounter = this._length * maxAutoRotations;
			this.setAutoRotation = setInterval(() => {
				this.autoRotation();
			}, autoRotateInterval);
		}

		this.$el.addClass(classInitialized);

	}

	uninitDOM() {
		const { classInitialized, classActivePanel, classActiveTab, selectorFocusEls } = this.options;
		this.$el.removeAttr('role aria-live').removeClass(classInitialized);
		this.$navPrev.removeAttr('role tabindex');
		this.$navNext.removeAttr('role tabindex');
		this.$panels.removeAttr('role aria-hidden').removeClass(classActivePanel);
		this.$panels.find(selectorFocusEls).removeAttr('tabindex');
		this.$tabs.removeAttr('role tabindex aria-selected').removeClass(classActiveTab);
		this.$tabs.find('.selected-text').remove();
		this.cancelAutoRotation();
		TweenMax.set(this.$innerTrack, {clearProps: 'all'});
	}

	_addEventListeners() {
		const self = this;

		this.$window.on(Events.BREAKPOINT_CHANGE, this.__onBreakpointChange.bind(this));

		this.$navPrev.on('click', this.__clickNavPrev.bind(this));

		this.$navNext.on('click', this.__clickNavNext.bind(this));

		this.$tabs.on('click', this.__clickTab.bind(this));

		this.$tabs.on('keydown', this.__keydownTab.bind(this));

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
		this.$tabs.off('click', this.__clickTab.bind(this));
		this.$tabs.off('keydown', this.__keydownTab.bind(this));
		if (this.options.enableSwipe) {
			this.$el.swipe('destroy');
		}
	}

	autoRotation() {
		this.state.previousIndex = this.state.currentIndex;
		this.state.currentIndex++;
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
		this.state.currentIndex--;

		this.updateCarousel(event);

	}

	__clickNavNext(event) {
		event.preventDefault();
		const { classNavDisabled } = this.options;

		if (this.state.isAnimating || this.$navNext.hasClass(classNavDisabled)) {return;}

		this.cancelAutoRotation();

		this.state.previousIndex = this.state.currentIndex;
		this.state.currentIndex++;

		this.updateCarousel(event);

	}

	__clickTab(event) {
		event.preventDefault();
		const index = this.$tabs.index(event.currentTarget);
		const $currentPanel = this.$panels.eq(index);

		if (this.state.isAnimating) {return;}

		this.cancelAutoRotation();

		if (this.state.currentIndex === index) {
			this.focusOnPanel($currentPanel);
		}
		else {
			this.state.currentIndex = index;
			this.updateCarousel(event);
		}

	}

	__keydownTab(event) {
		const { keys } = Constants;
		const keyCode = event.which;
		let index = this.$tabs.index(event.currentTarget);

		// spacebar; activate tab click
		if (keyCode === keys.space) {
			event.preventDefault();
			this.$tabs.eq(index).click();
		}

		// left/up arrow; emulate tabbing to previous tab
		else if (keyCode === keys.left || keyCode === keys.up) {
			event.preventDefault();
			if (index === 0) {index = this._length;}
			index--;
			this.$tabs.eq(index).focus();
		}

		// right/down arrow; emulate tabbing to next tab
		else if (keyCode === keys.right || keyCode === keys.down) {
			event.preventDefault();
			index++;
			if (index === this._length) {index = 0;}
			this.$tabs.eq(index).focus();
		}

		// home key; emulate jump-tabbing to first tab
		else if (keyCode === keys.home) {
			event.preventDefault();
			index = 0;
			this.$tabs.eq(index).focus();
		}

		// end key; emulate jump-tabbing to last tab
		else if (keyCode === keys.end) {
			event.preventDefault();
			index = this._length - 1;
			this.$tabs.eq(index).focus();
		}

	}


/**
*	Public Methods
**/

	updateCarousel(event) {
		const self = this;
		const { classActiveTab, animDuration, animEasing, customEventPrefix } = this.options;
		let $activePanel;
		let $activeTab;
		let $inactiveTab = this.$tabs.filter('.'+classActiveTab);

		this.state.isAnimating = true;

		this.adjustPosition();


		$activePanel = this.$panels.eq(this.state.currentIndex);
		$activeTab = this.$tabs.eq(this.state.currentIndex - this._length);
		console.log('$activeTab', $activeTab);

		this.deactivatePanels();
		this.activatePanels();
		this.deactivateTab($inactiveTab);
		this.activateTab($activeTab);

		TweenMax.to(this.$innerTrack, animDuration, {
			left: (this.scrollAmt * this.state.currentIndex) + '%',
			ease: animEasing,
			onComplete: function() {
				self.state.isAnimating = false;
				if (!!event) {
					self.focusOnPanel($activePanel);
				}
			}
		});

		$.event.trigger(`${customEventPrefix}:carouselUpdated`, {activeEl: $activePanel});

		this.fireTracking();
	}

	adjustPosition() {

		// if clone set 1 is visible
		if (this.state.currentIndex < this._length) {
			this.state.previousIndex += this._length;
			this.state.currentIndex += this._length;
			TweenMax.set(this.$innerTrack, {
				left: (this.scrollAmt * this.state.previousIndex) + '%'
			});
		}

		// if clone set 2 is visible
		if (this.state.currentIndex > (this._length + this._length) - 1) {
			this.state.previousIndex -= this._length;
			this.state.currentIndex -= this._length;
			TweenMax.set(this.$innerTrack, {
				left: (this.scrollAmt * this.state.previousIndex) + '%'
			});
		}

	}

	cancelAutoRotation() {
		if (!this.options.autoRotate) {return;}
		clearInterval(this.setAutoRotation);
		this.options.autoRotate = false;
	}

	deactivateTab($tab) {
		$tab.removeClass(this.options.classActiveTab).attr({'aria-selected': 'false'});
		$tab.find('.selected-text').remove();
	}

	activateTab($tab) {
		$tab.addClass(this.options.classActiveTab).attr({'aria-selected': 'true'});
		$tab.append(this.selectedLabel);
	}

	deactivatePanels() {
		const { classActivePanel, selectorFocusEls } = this.options;
		this.$panels.removeClass(classActivePanel).attr({'aria-hidden': 'true'});
		this.$panels.find(selectorFocusEls).attr({'tabindex': '-1'});
	}

	activatePanels() {
		const { classActivePanel, selectorFocusEls } = this.options;
		const $activePanel = this.$panels.eq(this.state.currentIndex);
		const $activeClonePanel1 = this.$panels.eq(this.state.currentIndex - this._length);
		const $activeClonePanel2 = this.$panels.eq(this.state.currentIndex + this._length);

		$activePanel.addClass(classActivePanel).attr({'aria-hidden': 'false'});
		$activePanel.find(selectorFocusEls).attr({'tabindex': '0'});
		$activeClonePanel1.addClass(classActivePanel);
		$activeClonePanel2.addClass(classActivePanel);

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
		this.$tabs = null;
		$.event.trigger(`${this.options.customEventPrefix}:unInitialized`);
	}

}

export default HeroCarousel;
