/*
	TITLE: Horizordion

	DESCRIPTION: A horizontal Accordion

	USAGE: const myHorizordion = new Horizordion('Element', 'Options')
		@param {HTMLElement}
		@param {Object}

	DEPENDENCIES:
		jquery 3.x

*/

import Constants from 'config/Constants';
import Events from 'config/Events';
import focusOnContentEl from 'utilities/focusOnContentEl';
import parseDatasetToObject from 'utilities/parseDatasetToObject';

class Horizordion {

	constructor(rootEl, options = {}) {
		if (!rootEl) {
			console.warn('Horizordion cannot initialize without rootEl');
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
			selectorTabs: '.horizordion--tab',
			selectorPanels: '.horizordion--panel',
			classActive: 'is-active',
			classDisabled: 'is-disabled',
			classInitialized: 'is-initialized',
			animDuration: Constants.timing.standard,
			selectorFocusEls: Constants.focusableElements,
			enableTracking: false,
			customEventPrefix: 'Horizordion'
		}, options, dataOptions);

		// elements
		this.tabEls = this.rootEl.querySelectorAll(this.options.selectorTabs);
		this.panelEls = this.rootEl.querySelectorAll(this.options.selectorPanels);

		// properties
		this.setInitialFocus = false;
		this._length = this.panelEls.length;
		if (this.options.initialIndex >= this._length) {this.options.initialIndex = 0;}

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
		const { classInitialized, selectorFocusEls } = this.options;
		const activeTabEl = this.state.currentIndex === -1 ? null : this.tabEls[this.state.currentIndex];
		const activePanelEl = this.state.currentIndex === -1 ? null : this.panelEls[this.state.currentIndex];

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

		if (activeTabEl) {
			this.activateTab(activeTabEl);
		}

		if (activePanelEl) {
			this.activatePanel(activePanelEl);
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
		const { classInitialized, classActive, selectorFocusEls } = this.options;

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
			panelEl.classList.remove(classActive);
			panelEl.querySelectorAll(selectorFocusEls).forEach((focusEl) => {
				focusEl.removeAttribute('tabindex');
			});
		});

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


	/**
	*	Event Handlers
	**/

	__clickTab(event) {
		event.preventDefault();
		if (event.target.classList.contains('ignore-click')) { return; }
		if (this.state.isAnimating) { return; }
		const currentTabEl = event.currentTarget;
		const index = [...this.tabEls].indexOf(currentTabEl);

		if (currentTabEl.classList.contains(this.options.classDisabled)) { return; }

		// currentIndex is open
		if (this.state.currentIndex === index) {
			this.state.previousIndex = null;
			this.state.currentIndex = -1;
			this.closePanel(index);
		}
		// currentIndex is -1, all are closed
		else if (this.state.currentIndex === -1) {
			this.state.previousIndex = null;
			this.state.currentIndex = index;
			this.openPanel(this.state.currentIndex);
		}
		// default behaviour
		else {
			this.state.previousIndex = this.state.currentIndex;
			this.state.currentIndex = index;
			this.closePanel(this.state.previousIndex);
			this.openPanel(this.state.currentIndex);
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
			if (index === 0) {
				index = this._length;
			}
			index--;
			this.tabEls[index].focus();
		}

		// right/down arrow; emulate tabbing to next tab
		else if (keyCode === keys.right || keyCode === keys.down) {
			event.preventDefault();
			index++;
			if (index === this._length) {
				index = 0;
			}
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

	closePanel(index) {
		const inactiveTabEl = this.tabEls[index];
		const inactivePanelEl = this.panelEls[index];

		this.isAnimating = true;

		this.deactivateTab(inactiveTabEl);

		this.deactivatePanel(inactivePanelEl);

		setTimeout(() => {
			this.isAnimating = false;
			inactiveTabEl.focus();
		}, this.options.animDuration);
	}

	openPanel(index) {
		const activeTabEl = this.tabEls[index];
		const activePanelEl = this.panelEls[index];

		this.isAnimating = true;

		this.activateTab(activeTabEl);

		this.activatePanel(activePanelEl);

		setTimeout(() => {
			this.isAnimating = false;
			this.focusOnPanel(activePanelEl);
		}, this.options.animDuration);
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
		focusOnContentEl($(panelEl)); //focusOnContentEl requires jQuery $element
	}

	fireTracking() {
		if (!this.options.enableTracking) { return; }
		const activePanelEl = this.panelEls[this.state.currentIndex];
		window.dispatchEvent(new CustomEvent(Events.TRACKING_STATE, {detail: {activePanelEl: activePanelEl}} ));
	}

	unInitialize() {
		this._removeEventListeners();
		this.uninitDOM();
		window.dispatchEvent(new CustomEvent(`${this.options.customEventPrefix}:unInitialized`, {detail: {rootEl: this.rootEl}} ));
	}

}

export default Horizordion;
