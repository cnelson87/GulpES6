/*
	TITLE: TabSwitcher

	DESCRIPTION: Basic TabSwitcher widget

	USAGE: const myTabSwitcher = new TabSwitcher('Element', 'Options')
		@param {HTMLElement}
		@param {Object}

	DEPENDENCIES:
		jquery 3.x
		HeightEqualizer

*/

import Constants from 'config/Constants';
import Events from 'config/Events';
import focusOnContentEl from 'utilities/focusOnContentEl';
import parseDatasetToObject from 'utilities/parseDatasetToObject';
import HeightEqualizer from 'widgets/HeightEqualizer';

class TabSwitcher {

	constructor(rootEl, options = {}) {
		if (!rootEl) {
			console.warn('TabSwitcher cannot initialize without rootEl');
			return;
		}
		this.initialize(rootEl, options);
	}

	initialize(rootEl, options) {
		const urlHash = location.hash.substring(1) || null;
		const dataOptions = rootEl.dataset.options ? parseDatasetToObject(rootEl.dataset.options) : {};

		// defaults
		this.rootEl = rootEl;
		this.options = Object.assign({
			initialIndex: 0,
			selectorTabs: '.tabswitcher--tabnav a',
			selectorPanelsContainer: '.tabswitcher--panels-container',
			selectorPanels: '.tabswitcher--panel',
			classActive: 'is-active',
			classDisabled: 'is-disabled',
			classInitialized: 'is-initialized',
			equalizeHeight: false,
			autoRotate: false,
			autoRotateInterval: Constants.timing.interval,
			maxAutoRotations: 5,
			animDuration: Constants.timing.standard,
			animEasing: 'easeOutQuint',
			selectorFocusEls: Constants.focusableElements,
			enableTracking: false,
			customEventPrefix: 'TabSwitcher'
		}, options, dataOptions);

		// elements
		this.tabEls = this.rootEl.querySelectorAll(this.options.selectorTabs);
		this.panelsContainerEl = this.rootEl.querySelector(this.options.selectorPanelsContainer);
		this.panelEls = this.panelsContainerEl.querySelectorAll(this.options.selectorPanels);

		// properties
		this._length = this.panelEls.length;
		if (this.options.initialIndex >= this._length) {this.options.initialIndex = 0;}
		this.heightEqualizer = null;
		this.setAutoRotation = null;
		this.setInitialFocus = false;

		// state
		this.state = {
			currentIndex: this.options.initialIndex,
			previousIndex: null,
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
		const { classInitialized, selectorFocusEls, selectorPanels, equalizeHeight, autoRotate, autoRotateInterval, maxAutoRotations } = this.options;
		const activeTabEl = this.tabEls[this.state.currentIndex];
		const activePanelEl = this.panelEls[this.state.currentIndex];

		this.rootEl.setAttribute('role', 'tablist');
		this.rootEl.setAttribute('aria-live', 'polite');

		this.tabEls.forEach((tabEl) => {
			tabEl.setAttribute('role', 'tab');
			tabEl.setAttribute('tabindex', '0');
			tabEl.setAttribute('aria-selected', 'false');
		});

		this.panelEls.forEach((panelEl) => {
			panelEl.setAttribute('role', 'tabpanel');
			panelEl.setAttribute('aria-hidden', 'true');
			panelEl.querySelectorAll(selectorFocusEls).forEach((focusEl) => {
				focusEl.setAttribute('tabindex', '-1');
			});
		});

		$(this.panelEls).hide();
		$(activePanelEl).show();

		this.activateTab(activeTabEl);

		this.activatePanel(activePanelEl);

		if (equalizeHeight) {
			this.heightEqualizer = new HeightEqualizer(this.panelsContainerEl, {
				selectorItems: selectorPanels,
				setParentHeight: true
			});
		}

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
		const { classInitialized, classActive, selectorFocusEls, equalizeHeight } = this.options;

		this.rootEl.removeAttribute('role');
		this.rootEl.removeAttribute('aria-live');

		this.tabEls.forEach((tabEl) => {
			tabEl.removeAttribute('role');
			tabEl.removeAttribute('tabindex');
			tabEl.removeAttribute('aria-selected');
			tabEl.classList.remove(classActive);
		});

		this.panelEls.forEach((panelEl) => {
			panelEl.removeAttribute('role');
			panelEl.removeAttribute('aria-hidden');
			panelEl.removeAttribute('style'); //remove jQuery css
			panelEl.classList.remove(classActive);
			panelEl.querySelectorAll(selectorFocusEls).forEach((focusEl) => {
				focusEl.removeAttribute('tabindex');
			});
		});

		if (equalizeHeight) {
			this.heightEqualizer.unInitialize();
		}

		this.rootEl.classList.remove(classInitialized);
	}

	_addEventListeners() {
		this.tabEls.forEach((tabEl) => {
			tabEl.addEventListener('click', this.__clickTab.bind(this));
			tabEl.addEventListener('keydown', this.__keydownTab.bind(this));
		});
	}

	_removeEventListeners() {
		this.tabEls.forEach((tabEl) => {
			tabEl.removeEventListener('click', this.__clickTab.bind(this));
			tabEl.removeEventListener('keydown', this.__keydownTab.bind(this));
		});
	}

	autoRotation() {
		this.state.previousIndex = this.state.currentIndex;
		this.state.currentIndex++;
		if (this.state.currentIndex === this._length) {this.state.currentIndex = 0;}

		this.switchPanels();
		this.autoRotationCounter--;

		if (this.autoRotationCounter === 0) {
			this.cancelAutoRotation();
		}
	}


	/**
	*	Event Handlers
	**/

	__clickTab(event) {
		event.preventDefault();
		if (event.target.classList.contains('ignore-click')) { return; }
		if (this.state.isAnimating) { return; }
		const currentTabEl = event.currentTarget;
		const index = [...this.tabEls].indexOf(currentTabEl);
		const currentPanelEl = this.panelEls[index];

		if (currentTabEl.classList.contains(this.options.classDisabled)) { return; }

		this.cancelAutoRotation();

		if (this.state.currentIndex === index) {
			this.focusOnPanel(currentPanelEl);
		}
		else {
			this.state.previousIndex = this.state.currentIndex;
			this.state.currentIndex = index;
			this.switchPanels(event);
		}

	}

	__keydownTab(event) {
		const { keys } = Constants;
		const keyCode = event.which;
		const currentTabEl = event.currentTarget;
		let index = [...this.tabEls].indexOf(currentTabEl);

		// spacebar; activate tab click
		if (keyCode === keys.space) {
			event.preventDefault();
			currentTabEl.click();
		}

		// left/up arrow; emulate tabbing to previous tab
		else if (keyCode === keys.left || keyCode === keys.up) {
			event.preventDefault();
			if (index === 0) {index = this._length;}
			index--;
			this.tabEls[index].focus();
		}

		// right/down arrow; emulate tabbing to next tab
		else if (keyCode === keys.right || keyCode === keys.down) {
			event.preventDefault();
			index++;
			if (index === this._length) {index = 0;}
			this.tabEls[index].focus();
		}

		// home key; emulate jump-tabbing to first tab
		else if (keyCode === keys.home) {
			event.preventDefault();
			index = 0;
			this.tabEls[index].focus();
		}

		// end key; emulate jump-tabbing to last tab
		else if (keyCode === keys.end) {
			event.preventDefault();
			index = this._length - 1;
			this.tabEls[index].focus();
		}

	}


	/**
	*	Public Methods
	**/

	switchPanels(event) {
		const { animDuration, animEasing, customEventPrefix } = this.options;
		const { currentIndex, previousIndex } = this.state;
		const inactiveTabEl = this.tabEls[previousIndex];
		const inactivePanelEl = this.panelEls[previousIndex];
		const activeTabEl = this.tabEls[currentIndex];
		const activePanelEl = this.panelEls[currentIndex];
		const $inactivePanelEl = $(inactivePanelEl); //need $element for jQuery animations
		const $activePanelEl = $(activePanelEl); //need $element for jQuery animations

		this.state.isAnimating = true;

		this.deactivateTab(inactiveTabEl);
		this.deactivatePanel(inactivePanelEl);

		this.activateTab(activeTabEl);
		this.activatePanel(activePanelEl);

		window.dispatchEvent(new CustomEvent(`${customEventPrefix}:panelWillClose`, {detail: {inactivePanelEl: inactivePanelEl}} ));
		window.dispatchEvent(new CustomEvent(`${customEventPrefix}:panelWillOpen`, {detail: {activePanelEl: activePanelEl}} ));

		$inactivePanelEl.hide();

		$activePanelEl.fadeIn({
			duration: animDuration,
			easing: animEasing,
			// step: () => {
			// 	window.dispatchEvent(new CustomEvent(`${customEventPrefix}:panelOpening`, {detail: {activePanelEl: activePanelEl}} ));
			// },
			complete: () => {
				this.state.isAnimating = false;
				if (event) {
					this.focusOnPanel(activePanelEl);
				}
				window.dispatchEvent(new CustomEvent(`${customEventPrefix}:panelDidClose`, {detail: {inactivePanelEl: inactivePanelEl}} ));
				window.dispatchEvent(new CustomEvent(`${customEventPrefix}:panelDidOpen`, {detail: {activePanelEl: activePanelEl}} ));
			}
		});

		this.fireTracking();
	}

	cancelAutoRotation() {
		if (!this.options.autoRotate) { return; }
		clearInterval(this.setAutoRotation);
		this.options.autoRotate = false;
	}

	deactivateTab(tabEl) {
		if (!tabEl) { console.warn('deactivateTab: !tabEl'); return; }
		tabEl.classList.remove(this.options.classActive);
		tabEl.setAttribute('aria-selected', 'false');
	}

	activateTab(tabEl) {
		if (!tabEl) { console.warn('activateTab: !tabEl'); return; }
		tabEl.classList.add(this.options.classActive);
		tabEl.setAttribute('aria-selected', 'true');
	}

	deactivatePanel(panelEl) {
		if (!panelEl) { console.warn('deactivatePanel: !panelEl'); return; }
		panelEl.classList.remove(this.options.classActive);
		panelEl.setAttribute('aria-hidden', 'true');
		panelEl.querySelectorAll(this.options.selectorFocusEls).forEach((focusEl) => {
			focusEl.setAttribute('tabindex', '-1');
		});
	}

	activatePanel(panelEl) {
		if (!panelEl) { console.warn('activatePanel: !panelEl'); return; }
		panelEl.classList.add(this.options.classActive);
		panelEl.setAttribute('aria-hidden', 'false');
		panelEl.querySelectorAll(this.options.selectorFocusEls).forEach((focusEl) => {
			focusEl.setAttribute('tabindex', '0');
		});
	}

	focusOnPanel(panelEl) {
		if (!panelEl) { console.warn('focusOnPanel: !panelEl'); return; }
		const extraTopOffset = this.rootEl.offsetHeight;
		focusOnContentEl($(panelEl), extraTopOffset); //focusOnContentEl requires jQuery $element
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

export default TabSwitcher;
