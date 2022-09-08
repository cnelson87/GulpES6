/*
	TITLE: AutoRotator

	DESCRIPTION: Auto show / hide a list of elements

	USAGE: const myAutoRotator = new AutoRotator('Element', 'Options')
		@param {HTMLElement}
		@param {Object}

	DEPENDENCIES:
		jquery 3.x
		greensock 3.x

*/

import Constants from 'config/Constants';

class AutoRotator {

	constructor(rootEl, options = {}) {
		if (!rootEl) {
			console.warn('AutoRotator cannot initialize without rootEl');
			return;
		}
		this.initialize(rootEl, options);
	}

	initialize(rootEl, options) {

		// defaults
		this.rootEl = rootEl;
		this.options = Object.assign({
			initialIndex: 0,
			selectorPanels: 'article',
			autoRotateInterval: Constants.timing.interval,
			animDuration: (Constants.timing.fast / 1000),
			animEasing: 'power4.inOut',
			customEventPrefix: 'AutoRotator'
		}, options);

		// elements
		this.panelEls = this.rootEl.querySelectorAll(this.options.selectorPanels);

		// properties
		this._length = this.panelEls.length;
		if (this.options.initialIndex >= this._length) {this.options.initialIndex = 0;}
		this.rotationInterval = this.options.autoRotateInterval;

		// state
		this.state = {
			currentIndex: this.options.initialIndex,
			previousIndex: null,
		};

		this.setDOM();

		window.dispatchEvent(new CustomEvent(`${this.options.customEventPrefix}:isInitialized`, {detail: {rootEl: this.rootEl}} ));
	}

	setDOM() {
		const activePanelEl = this.panelEls[this.state.currentIndex];

		gsap.set(this.panelEls, {
			left: '100%',
			zIndex: 1
		});

		gsap.set(activePanelEl, {
			left: '0',
			zIndex: 9
		});

		this.setAutoRotation = setInterval(() => {
			this.autoRotation();
		}, this.rotationInterval);
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
		const activePanelEl = this.panelEls[this.state.currentIndex];
		const inactivePanelEl = this.panelEls[this.state.previousIndex];

		gsap.set(inactivePanelEl, {
			zIndex: 8
		});

		gsap.set(activePanelEl, {
			zIndex: 9
		});

		gsap.to(activePanelEl, {
			duration: this.options.animDuration,
			ease: this.options.animEasing,
			left: 0,
			onComplete: function() {
				gsap.set(inactivePanelEl, {
					left: '100%',
					zIndex: 1
				});
			}
		});

	}

}

export default AutoRotator;
