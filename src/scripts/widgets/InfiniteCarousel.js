/*
	TITLE: InfiniteCarousel

	DESCRIPTION: An infinitely looping carousel widget

	USAGE: const myCarousel = new InfiniteCarousel('Element', 'Options')
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

class InfiniteCarousel {

	constructor(rootEl, options = {}) {
		if (!rootEl) {
			console.warn('InfiniteCarousel cannot initialize without rootEl');
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
			numItemsToAnimate: 1,
			selectorNavPrev: '.carousel--nav-prev',
			selectorNavNext: '.carousel--nav-next',
			selectorInnerTrack: '.carousel--inner-track',
			selectorPanels: '.carousel--panel',
			classPanelActive: 'is-active',
			classNavDisabled: 'is-disabled',
			classInitialized: 'is-initialized',
			enableSwipe: true,
			autoRotate: false,
			autoRotateInterval: Constants.timing.interval,
			maxAutoRotations: 5,
			animDuration: (Constants.timing.standard / 1000),
			animEasing: 'power4.inOut',
			selectorFocusEls: Constants.focusableElements,
			enableTracking: false,
			customEventPrefix: 'InfiniteCarousel'
		}, options, dataOptions);

		// elements
		this.navPrevEl = this.rootEl.querySelector(this.options.selectorNavPrev);
		this.navNextEl = this.rootEl.querySelector(this.options.selectorNavNext);
		this.innerTrackEl = this.rootEl.querySelector(this.options.selectorInnerTrack);
		this.panelEls = this.innerTrackEl.querySelectorAll(this.options.selectorPanels);

		// properties
		this._length = this.panelEls.length;
		if (this.options.initialIndex >= this._length) {this.options.initialIndex = 0;}
		this.numItemsToAnimate = this.options.numItemsToAnimate;
		this.scrollAmt = -PERCENT * this.numItemsToAnimate;
		this.setAutoRotation = null;
		this.setInitialFocus = false;

		// state
		this.state = {
			currentIndex: this.options.initialIndex + this._length,
			previousIndex: null,
			isAnimating: false,
			currentBreakpoint: State.currentBreakpoint,
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

		// clone panels for looping
		$(this.panelEls).clone().appendTo(this.innerTrackEl);
		$(this.panelEls).clone().appendTo(this.innerTrackEl);
		this.panelEls = this.innerTrackEl.querySelectorAll(this.options.selectorPanels);

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

		this.deactivatePanels();
		this.activatePanels();

		gsap.set(this.innerTrackEl, {
			left: (this.scrollAmt * this.state.currentIndex) + '%'
		});

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

	__onBreakpointChange() {
		this.state.currentBreakpoint = State.currentBreakpoint;
	}

	__clickNavPrev(event) {
		event.preventDefault();
		if (this.state.isAnimating || this.navPrevEl.classList.contains(this.options.classNavDisabled)) { return; }
		this.cancelAutoRotation();
		this.state.previousIndex = this.state.currentIndex;
		this.state.currentIndex -= this.numItemsToAnimate;
		this.updateCarousel(event);
	}

	__clickNavNext(event) {
		event.preventDefault();
		if (this.state.isAnimating || this.navNextEl.classList.contains(this.options.classNavDisabled)) { return; }
		this.cancelAutoRotation();
		this.state.previousIndex = this.state.currentIndex;
		this.state.currentIndex += this.numItemsToAnimate;
		this.updateCarousel(event);
	}


	/**
	*	Public Methods
	**/

	updateCarousel(event) {
		const { animDuration, animEasing, customEventPrefix } = this.options;
		let activePanelEl;

		this.state.isAnimating = true;

		this.adjustPosition();
		this.deactivatePanels();
		this.activatePanels();

		activePanelEl = this.panelEls[this.state.currentIndex];

		window.dispatchEvent(new CustomEvent(`${customEventPrefix}:carouselWillUpdate`, {detail: {activePanelEl: activePanelEl}} ));

		gsap.to(this.innerTrackEl, {
			duration: animDuration,
			ease: animEasing,
			left: (this.scrollAmt * this.state.currentIndex) + '%',
			onComplete: () => {
				this.state.isAnimating = false;
				if (event) {
					this.focusOnPanel(activePanelEl);
				}
				window.dispatchEvent(new CustomEvent(`${customEventPrefix}:carouselDidUpdate`, {detail: {activePanelEl: activePanelEl}} ));
			}
		});

		this.fireTracking();
	}

	adjustPosition() {

		if (this.state.currentIndex < this._length) {
			this.state.previousIndex += this._length;
			this.state.currentIndex += this._length;
			gsap.set(this.innerTrackEl, {
				left: (this.scrollAmt * this.state.previousIndex) + '%'
			});
		}

		if (this.state.currentIndex > (this._length + this._length) - 1) {
			this.state.previousIndex -= this._length;
			this.state.currentIndex -= this._length;
			gsap.set(this.innerTrackEl, {
				left: (this.scrollAmt * this.state.previousIndex) + '%'
			});
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
		const { classPanelActive, selectorFocusEls } = this.options;
		const activePanelEl = this.panelEls[this.state.currentIndex];
		const activeClonePanel1 = this.panelEls[this.state.currentIndex - this._length];
		const activeClonePanel2 = this.panelEls[this.state.currentIndex + this._length];

		activePanelEl.classList.add(classPanelActive);
		activePanelEl.setAttribute('aria-hidden', 'false');
		activePanelEl.querySelectorAll(selectorFocusEls).forEach((focusEl) => {
			focusEl.setAttribute('tabindex', '0');
		});
		activeClonePanel1.classList.add(classPanelActive);
		activeClonePanel2.classList.add(classPanelActive);
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

export default InfiniteCarousel;
