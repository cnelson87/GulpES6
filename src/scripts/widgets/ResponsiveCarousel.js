/*
	TITLE: ResponsiveCarousel

	DESCRIPTION: A carousel widget that responds to mobile, tablet, and desktop media queries

	USAGE: const myCarousel = new ResponsiveCarousel('Element', 'Options')
		@param {HTMLElement}
		@param {Object}

	DEPENDENCIES:
		jquery 3.x
		greensock 3.x

*/

import Constants from 'config/Constants';
import Events from 'config/Events';
import State from 'config/State';
import focusOnContentEl from 'utilities/focusOnContentEl';
import parseDatasetToObject from 'utilities/parseDatasetToObject';

const PERCENT = 100;

class ResponsiveCarousel {

	constructor(rootEl, options = {}) {
		if (!rootEl) {
			console.warn('ResponsiveCarousel cannot initialize without rootEl');
			return;
		}
		this.initialize(rootEl, options);
	}

	initialize(rootEl, options) {
		const urlHash = location.hash.substring(1) || null;
		const dataOptions = rootEl.dataset.options ? parseDatasetToObject(rootEl.dataset.options) : {};

		// defaults
		this.rootEl = rootEl;
		this.$rootEl = $(rootEl); //need $element for jQuery.swipe
		this.options = Object.assign({
			initialIndex: 0,
			numVisibleItemsMobile: 1,
			numItemsToAnimateMobile: 1,
			numVisibleItemsTablet: 1,
			numItemsToAnimateTablet: 1,
			numVisibleItemsDesktop: 1,
			numItemsToAnimateDesktop: 1,
			enableSwipe: true,
			loopEndToEnd: true,
			staggerActiveItems: false,
			selectorNavPrev: '.carousel--nav-prev',
			selectorNavNext: '.carousel--nav-next',
			selectorInnerTrack: '.carousel--inner-track',
			selectorPanels: '.carousel--panel',
			classPanelActive: 'is-active',
			classNavDisabled: 'is-disabled',
			classInitialized: 'is-initialized',
			autoRotate: false,
			autoRotateInterval: Constants.timing.interval,
			maxAutoRotations: 5,
			animDuration: (Constants.timing.standard / 1000),
			animEasing: 'power4.inOut',
			selectorFocusEls: Constants.focusableElements,
			enableTracking: false,
			customEventPrefix: 'ResponsiveCarousel'
		}, options, dataOptions);

		// elements
		this.navPrevEl = this.rootEl.querySelector(this.options.selectorNavPrev);
		this.navNextEl = this.rootEl.querySelector(this.options.selectorNavNext);
		this.innerTrackEl = this.rootEl.querySelector(this.options.selectorInnerTrack);
		this.panelEls = this.innerTrackEl.querySelectorAll(this.options.selectorPanels);

		// properties
		this._length = this.panelEls.length;
		if (this.options.initialIndex >= this._length) {this.options.initialIndex = 0;}
		this.lastIndex = null;
		this.itemWidth = null;
		this.scrollAmt = null;
		this.trackWidth = null;
		this.numVisibleItems = null;
		this.numItemsToAnimate = null;
		this.setInitialFocus = false;

		// state
		this.state = {
			currentIndex: this.options.initialIndex,
			isAnimating: false,
		};

		// check url hash to override currentIndex
		if (urlHash) {
			for (let i=0; i<this._length; i++) {
				if (this.panelEls[i].dataset.id === urlHash) {
					this.state.currentIndex = i;
					this.setInitialFocus = true;
					break;
				}
			}
		}

		this.initDOM();

		this._addEventListeners();

		window.dispatchEvent(new CustomEvent(`${this.options.customEventPrefix}:isInitialized`, {detail: {rootEl: this.rootEl}} ));
	}


	/**
	*	Private Methods
	**/

	initDOM() {
		const { classInitialized, autoRotate, autoRotateInterval, maxAutoRotations } = this.options;
		const activePanelEl = this.panelEls[this.state.currentIndex];

		this.rootEl.setAttribute('role', 'tablist');
		this.rootEl.setAttribute('aria-live', 'polite');

		this.navPrevEl.setAttribute('role', 'button');
		this.navPrevEl.setAttribute('tabindex', '0');

		this.navNextEl.setAttribute('role', 'button');
		this.navNextEl.setAttribute('tabindex', '0');

		this.panelEls.forEach((panelEl) => {
			panelEl.setAttribute('role', 'tabpanel');
			panelEl.setAttribute('aria-hidden', 'true');
		});

		this.setProperties();

		this.setDOM();

		// auto-rotate items
		if (autoRotate) {
			this.autoRotationCounter = this._length * maxAutoRotations;
			this.setAutoRotation = setInterval(() => {
				this.autoRotation();
			}, autoRotateInterval);
		}

		this.rootEl.classList.add(classInitialized);

		// initial focus on content
		window.onload = () => {
			if (this.setInitialFocus) {
				this.focusOnPanel(activePanelEl);
			}
		};
	}

	setProperties() {
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
			this.navPrevEl.classList.add(this.options.classNavDisabled);
			this.navPrevEl.setAttribute('tabindex', '-1');
			this.navNextEl.classList.add(this.options.classNavDisabled);
			this.navNextEl.setAttribute('tabindex', '-1');
		}

		// adjust initial position
		this.panelEls.forEach((panelEl) => {
			panelEl.style.width = itemWidth;
		});
		gsap.set(this.innerTrackEl, {
			left: leftPos,
			width: trackWidth,
		});

		this.deactivatePanels();
		this.activatePanels();
	}

	uninitDOM() {
		const { classInitialized, classPanelActive, selectorFocusEls } = this.options;

		this.rootEl.removeAttribute('role');
		this.rootEl.removeAttribute('aria-live');

		this.navPrevEl.removeAttribute('role');
		this.navPrevEl.removeAttribute('tabindex');

		this.navNextEl.removeAttribute('role');
		this.navNextEl.removeAttribute('tabindex');

		this.panelEls.forEach((panelEl) => {
			panelEl.removeAttribute('role');
			panelEl.removeAttribute('aria-hidden');
			panelEl.removeAttribute('style'); //remove jQuery/greensock css
			panelEl.classList.remove(classPanelActive);
			panelEl.querySelectorAll(selectorFocusEls).forEach((focusEl) => {
				focusEl.removeAttribute('tabindex');
			});
		});

		gsap.set(this.innerTrackEl, {clearProps: 'all'});

		this.rootEl.classList.remove(classInitialized);
	}

	_addEventListeners() {
		window.addEventListener(Events.BREAKPOINT_CHANGE, this.__onBreakpointChange.bind(this));
		this.navPrevEl.addEventListener('click', this.__clickNavPrev.bind(this));
		this.navNextEl.addEventListener('click', this.__clickNavNext.bind(this));
		if (this.options.enableSwipe) {
			this.$rootEl.swipe({
				allowPageScroll: 'vertical',
				excludedElements: '.noSwipe',
				fingers: 'all',
				threshold: 50,
				triggerOnTouchEnd: false, // triggers on threshold
				swipeLeft: () => {
					this.navNextEl.click();
				},
				swipeRight: () => {
					this.navPrevEl.click();
				},
			});
		}
	}

	_removeEventListeners() {
		window.removeEventListener(Events.BREAKPOINT_CHANGE, this.__onBreakpointChange.bind(this));
		this.navPrevEl.removeEventListener('click', this.__clickNavPrev.bind(this));
		this.navNextEl.removeEventListener('click', this.__clickNavNext.bind(this));
		if (this.options.enableSwipe) {
			this.$rootEl.swipe('destroy');
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

	__onBreakpointChange() {
		this.setProperties();
		this.setDOM();
	}

	__clickNavPrev(event) {
		event.preventDefault();
		if (this.state.isAnimating || this.navPrevEl.classList.contains(this.options.classNavDisabled)) { return; }

		this.cancelAutoRotation();

		if (this.options.loopEndToEnd && this.state.currentIndex === 0) {
			this.state.currentIndex = this.lastIndex;
		}
		else {
			this.state.currentIndex -= this.numItemsToAnimate;
			if (this.state.currentIndex < 0) {this.state.currentIndex = 0;}
		}

		this.updateCarousel(event);
	}

	__clickNavNext(event) {
		event.preventDefault();
		if (this.state.isAnimating || this.navNextEl.classList.contains(this.options.classNavDisabled)) { return; }

		this.cancelAutoRotation();

		if (this.options.loopEndToEnd && this.state.currentIndex === this.lastIndex) {
			this.state.currentIndex = 0;
		}
		else {
			this.state.currentIndex += this.numItemsToAnimate;
			if (this.state.currentIndex > this.lastIndex) {this.state.currentIndex = this.lastIndex;}
		}

		this.updateCarousel(event);
	}


	/**
	*	Public Methods
	**/

	updateCarousel(event) {
		const { customEventPrefix, animDuration, animEasing } = this.options;
		const { currentIndex } = this.state;
		const activePanelEl = this.panelEls[currentIndex];
		const leftPos = (this.scrollAmt * currentIndex) + '%';

		this.state.isAnimating = true;

		this.deactivatePanels();

		this.updateNav();

		window.dispatchEvent(new CustomEvent(`${customEventPrefix}:carouselWillUpdate`, {detail: {activePanelEl: activePanelEl}} ));

		gsap.to(this.innerTrackEl, {
			duration: animDuration,
			ease: animEasing,
			left: leftPos,
			onComplete: () => {
				this.state.isAnimating = false;
				this.activatePanels();
				if (event) {
					this.focusOnPanel(activePanelEl);
				}
				window.dispatchEvent(new CustomEvent(`${customEventPrefix}:carouselDidUpdate`, {detail: {activePanelEl: activePanelEl}} ));
			}
		});

		this.fireTracking();
	}

	updateNav() {
		const { loopEndToEnd, classNavDisabled } = this.options;

		if (!loopEndToEnd) {
			this.navPrevEl.classList.remove(classNavDisabled);
			this.navPrevEl.setAttribute('tabindex', '0');
			this.navNextEl.classList.remove(classNavDisabled);
			this.navNextEl.setAttribute('tabindex', '0');

			if (this.state.currentIndex <= 0) {
				this.navPrevEl.classList.add(classNavDisabled);
				this.navPrevEl.setAttribute('tabindex', '-1');
			}
			if (this.state.currentIndex >= this.lastIndex) {
				this.navNextEl.classList.add(classNavDisabled);
				this.navNextEl.setAttribute('tabindex', '-1');
			}
		}
	}

	cancelAutoRotation() {
		if (!this.options.autoRotate) {return;}
		clearInterval(this.setAutoRotation);
		this.options.autoRotate = false;
	}

	deactivatePanels() {
		const { classPanelActive, selectorFocusEls } = this.options;
		this.panelEls.forEach((panelEl) => {
			panelEl.setAttribute('aria-hidden', 'true');
			panelEl.classList.remove(classPanelActive);
			panelEl.querySelectorAll(selectorFocusEls).forEach((focusEl) => {
				focusEl.setAttribute('tabindex', '-1');
			});
		});
	}

	activatePanels() {
		const { staggerActiveItems, selectorFocusEls, classPanelActive } = this.options;
		const first = this.state.currentIndex;
		const last = this.state.currentIndex + this.numVisibleItems;
		const activePanelEls = [...this.panelEls].slice(first, last);
		let delay = 100;

		if (staggerActiveItems) {
			//activate all current items incrementally
			activePanelEls.forEach((panelEl, index) => {
				const $panelEl = $(panelEl);
				$panelEl.delay(delay*index).queue(() => {
					panelEl.classList.add(classPanelActive);
					panelEl.setAttribute('aria-hidden', 'false');
					panelEl.querySelectorAll(selectorFocusEls).forEach((focusEl) => {
						focusEl.setAttribute('tabindex', '0');
					});
					$panelEl.dequeue();
				});
			});
		}
		else {
			//activate all current items at once
			activePanelEls.forEach((panelEl) => {
				panelEl.classList.add(classPanelActive);
				panelEl.setAttribute('aria-hidden', 'false');
				panelEl.querySelectorAll(selectorFocusEls).forEach((focusEl) => {
					focusEl.setAttribute('tabindex', '0');
				});
			});
		}

	}

	focusOnPanel(panelEl) {
		if (!panelEl) { console.warn('focusOnPanel: !panelEl'); return; }
		focusOnContentEl($(panelEl)); //focusOnContentEl requires jQuery $element
	}

	fireTracking() {
		if (!this.options.enableTracking) { return; }
		const activePanelEl = this.panelEls[this.state.currentIndex];
		window.dispatchEvent(new CustomEvent(Events.TRACKING_STATE, {detail: {activePanelEl: activePanelEl}} ));
	}

	unInitialize() {
		this._removeEventListeners();
		this.cancelAutoRotation();
		this.uninitDOM();
		window.dispatchEvent(new CustomEvent(`${this.options.customEventPrefix}:unInitialized`, {detail: {rootEl: this.rootEl}} ));
	}

}

export default ResponsiveCarousel;
