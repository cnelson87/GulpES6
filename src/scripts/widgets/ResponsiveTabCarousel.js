/*
	TITLE: ResponsiveTabCarousel

	DESCRIPTION: Subclass of ResponsiveTabCarousel adds tab navigation
	NOTE: The tabs only work if mobile/tablet/desktop views all display one 'panel' at a time.

	USAGE: const myTabCarousel = new ResponsiveTabCarousel('Element', 'Options')
		@param {HTMLElement}
		@param {Object}

*/

import Constants from 'config/Constants';
import parseDatasetToObject from 'utilities/parseDatasetToObject';
import ResponsiveCarousel from 'widgets/ResponsiveCarousel';

class ResponsiveTabCarousel extends ResponsiveCarousel {

	initialize(rootEl, options) {
		const dataOptions = rootEl.dataset.options ? parseDatasetToObject(rootEl.dataset.options) : {};

		const subclassOptions = Object.assign({
			initialIndex: 0,
			numVisibleItemsMobile: 1,
			numItemsToAnimateMobile: 1,
			numVisibleItemsTablet: 1,
			numItemsToAnimateTablet: 1,
			numVisibleItemsDesktop: 1,
			numItemsToAnimateDesktop: 1,
			selectorTabs: '.carousel--tabnav a',
			classTabActive: 'is-active',
			customEventPrefix: 'ResponsiveTabCarousel'
		}, options, dataOptions);

		// elements
		this.tabEls = rootEl.querySelectorAll(subclassOptions.selectorTabs);

		super.initialize(rootEl, subclassOptions);
	}


	/**
	*	Private Methods
	**/

	initDOM() {
		const activeTabEl = this.tabEls[this.state.currentIndex];
		this.tabEls.forEach((tabEl) => {
			tabEl.setAttribute('role', 'tab');
			tabEl.setAttribute('tabindex', '0');
			tabEl.setAttribute('aria-selected', 'false');
		});
		activeTabEl.classList.add(this.options.classTabActive);
		activeTabEl.setAttribute('aria-selected', 'true');
		super.initDOM();
	}

	uninitDOM() {
		this.tabEls.forEach((tabEl) => {
			tabEl.removeAttribute('role');
			tabEl.removeAttribute('tabindex');
			tabEl.removeAttribute('aria-selected');
			tabEl.classList.remove(this.options.classTabActive);
		});
		super.uninitDOM();
	}

	_addEventListeners() {
		this.tabEls.forEach((tabEl) => {
			tabEl.addEventListener('click', this.__clickTab.bind(this));
			tabEl.addEventListener('keydown', this.__keydownTab.bind(this));
		});
		super._addEventListeners();
	}

	_removeEventListeners() {
		this.tabEls.forEach((tabEl) => {
			tabEl.removeEventListener('click', this.__clickTab.bind(this));
			tabEl.removeEventListener('keydown', this.__keydownTab.bind(this));
		});
		super._removeEventListeners();
	}


	/**
	*	Event Handlers
	**/

	__clickTab(event) {
		event.preventDefault();
		if (this.state.isAnimating) { return; }
		const currentTabEl = event.currentTarget;
		const index = [...this.tabEls].indexOf(currentTabEl);
		const currentPanelEl = this.panelEls[index];

		if (currentTabEl.classList.contains(this.options.classNavDisabled)) { return; }

		this.cancelAutoRotation();

		if (this.state.currentIndex === index) {
			this.focusOnPanel(currentPanelEl);
		}
		else {
			this.state.currentIndex = index;
			this.updateCarousel(event);
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

	updateNav() {
		const { classTabActive } = this.options;
		const inactiveTabEl = this.rootEl.querySelector(this.options.selectorTabs+'.'+classTabActive);
		const activeTabEl = this.tabEls[this.state.currentIndex];

		inactiveTabEl.classList.remove(classTabActive);
		inactiveTabEl.setAttribute('aria-selected', 'false');

		activeTabEl.classList.add(classTabActive);
		activeTabEl.setAttribute('aria-selected', 'true');

		super.updateNav();
	}

}

export default ResponsiveTabCarousel;
