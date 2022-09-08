/*
	TITLE: MiniAccordion

	DESCRIPTION: A single Accordion item

	USAGE: const myAccordion = new MiniAccordion('Element', 'Options')
		@param {HTMLElement}
		@param {Object}

	DEPENDENCIES:
		jquery 3.x

*/

import Constants from 'config/Constants';
import Events from 'config/Events';
import focusOnContentEl from 'utilities/focusOnContentEl';
import parseDatasetToObject from 'utilities/parseDatasetToObject';

class MiniAccordion {

	constructor(rootEl, options = {}) {
		if (!rootEl) {
			console.warn('MiniAccordion cannot initialize without rootEl');
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
			initialOpen: false,
			selectorTab: '.accordion--header a',
			selectorPanel: '.accordion--panel',
			classActive: 'is-active',
			animDuration: Constants.timing.standard,
			animEasing: 'easeOutQuint',
			selectorFocusEls: Constants.focusableElements,
			enableTracking: false,
			customEventPrefix: 'MiniAccordion'
		}, options, dataOptions);

		// elements
		this.tabEl = this.rootEl.querySelector(this.options.selectorTab);
		this.panelEl = this.rootEl.querySelector(this.options.selectorPanel);
		this.$panelEl = $(this.panelEl); //need $element for jQuery animations

		// state
		this.state = {
			isActive: this.options.initialOpen,
			isAnimating: false,
		};

		// check url hash to override isActive
		this.setInitialFocus = false;
		if (urlHash && this.panelEl.dataset.id === urlHash) {
			this.state.isActive = true;
			this.setInitialFocus = true;
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

		this.rootEl.setAttribute('role', 'tablist');
		this.rootEl.setAttribute('aria-live', 'polite');

		this.tabEl.setAttribute('role', 'tab');
		this.tabEl.setAttribute('tabindex', '0');
		this.tabEl.setAttribute('aria-selected', 'false');

		this.panelEl.setAttribute('role', 'tabpanel');
		this.panelEl.setAttribute('aria-hidden', 'true');
		this.panelEl.querySelectorAll(selectorFocusEls).forEach((focusEl) => {
			focusEl.setAttribute('tabindex', '-1');
		});

		if (this.state.isActive) {
			this.activateTab();
			this.activatePanel();
			this.$panelEl.show();
		} else {
			this.$panelEl.hide();
		}

		this.rootEl.classList.add(classInitialized);

		// initial focus on content
		window.onload = () => {
			if (this.setInitialFocus) {
				this.focusOnPanel();
			}
		};
	}

	uninitDOM() {
		const { classInitialized, classActive, selectorFocusEls } = this.options;

		this.rootEl.removeAttribute('role');
		this.rootEl.removeAttribute('aria-live');

		this.tabEl.removeAttribute('role');
		this.tabEl.removeAttribute('tabindex');
		this.tabEl.removeAttribute('aria-selected');
		this.tabEl.classList.remove(classActive);

		this.panelEl.removeAttribute('role');
		this.panelEl.removeAttribute('aria-hidden');
		this.panelEl.removeAttribute('style'); //remove jQuery css
		this.panelEl.classList.remove(classActive);
		this.panelEl.querySelectorAll(selectorFocusEls).forEach((focusEl) => {
			focusEl.removeAttribute('tabindex');
		});

		this.rootEl.classList.remove(classInitialized);
	}

	_addEventListeners() {
		this.tabEl.addEventListener('click', this.__clickTab.bind(this));
		this.tabEl.addEventListener('keydown', this.__keydownTab.bind(this));
	}

	_removeEventListeners() {
		this.tabEl.removeEventListener('click', this.__clickTab.bind(this));
		this.tabEl.removeEventListener('keydown', this.__keydownTab.bind(this));
	}


	/**
	*	Event Handlers
	**/

	__clickTab(event) {
		event.preventDefault();
		if (event.target.classList.contains('ignore-click')) { return; }
		if (this.state.isAnimating) { return; }

		if (this.state.isActive) {
			this.animateClosed();
		} else {
			this.animateOpen();
		}
	}

	__keydownTab(event) {
		const { keys } = Constants;
		const keyCode = event.which;

		// spacebar; activate tab click
		if (keyCode === keys.space) {
			event.preventDefault();
			this.tabEl.click();
		}
	}


	/**
	*	Public Methods
	**/

	animateClosed() {
		const { animDuration, animEasing, customEventPrefix } = this.options;
		const panelEl = this.panelEl;

		this.state.isAnimating = true;

		this.state.isActive = false;

		this.deactivateTab();

		this.deactivatePanel();

		window.dispatchEvent(new CustomEvent(`${customEventPrefix}:panelWillClose`, {detail: {inactivePanelEl: panelEl}} ));

		this.$panelEl.slideUp({
			duration: animDuration,
			easing: animEasing,
			// step: () => {
			// 	window.dispatchEvent(new CustomEvent(`${customEventPrefix}:panelClosing`, {detail: {inactivePanelEl: panelEl}} ));
			// },
			complete: () => {
				this.state.isAnimating = false;
				this.tabEl.focus();
				window.dispatchEvent(new CustomEvent(`${customEventPrefix}:panelDidClose`, {detail: {inactivePanelEl: panelEl}} ));
			}
		});
	}

	animateOpen() {
		const { animDuration, animEasing, customEventPrefix } = this.options;
		const panelEl = this.panelEl;

		this.state.isAnimating = true;

		this.state.isActive = true;

		this.activateTab();

		this.activatePanel();

		window.dispatchEvent(new CustomEvent(`${customEventPrefix}:panelWillOpen`, {detail: {activePanelEl: panelEl}} ));

		this.$panelEl.slideDown({
			duration: animDuration,
			easing: animEasing,
			// step: () => {
			// 	window.dispatchEvent(new CustomEvent(`${customEventPrefix}:panelOpening`, {detail: {activePanelEl: panelEl}} ));
			// },
			complete: () => {
				this.state.isAnimating = false;
				this.focusOnPanel();
				window.dispatchEvent(new CustomEvent(`${customEventPrefix}:panelDidOpen`, {detail: {activePanelEl: panelEl}} ));
			}
		});

		this.fireTracking();
	}

	deactivateTab() {
		const tabEl = this.tabEl;
		tabEl.classList.remove(this.options.classActive);
		tabEl.setAttribute('aria-selected', 'false');
	}

	activateTab() {
		const tabEl = this.tabEl;
		tabEl.classList.add(this.options.classActive);
		tabEl.setAttribute('aria-selected', 'true');
	}

	deactivatePanel() {
		const panelEl = this.panelEl;
		panelEl.classList.remove(this.options.classActive);
		panelEl.setAttribute('aria-hidden', 'true');
		panelEl.querySelectorAll(this.options.selectorFocusEls).forEach((focusEl) => {
			focusEl.setAttribute('tabindex', '-1');
		});
	}

	activatePanel() {
		const panelEl = this.panelEl;
		panelEl.classList.add(this.options.classActive);
		panelEl.setAttribute('aria-hidden', 'false');
		panelEl.querySelectorAll(this.options.selectorFocusEls).forEach((focusEl) => {
			focusEl.setAttribute('tabindex', '0');
		});
	}

	focusOnPanel() {
		const extraTopOffset = this.rootEl.offsetHeight;
		focusOnContentEl(this.$panelEl, extraTopOffset); //focusOnContentEl requires jQuery $element
	}

	fireTracking() {
		if (!this.options.enableTracking) { return; }
		window.dispatchEvent(new CustomEvent(Events.TRACKING_STATE, {detail: {activePanelEl: this.panelEl}} ));
	}

	unInitialize() {
		this._removeEventListeners();
		this.uninitDOM();
		window.dispatchEvent(new CustomEvent(`${this.options.customEventPrefix}:unInitialized`, {detail: {rootEl: this.rootEl}} ));
	}

}

export default MiniAccordion;
