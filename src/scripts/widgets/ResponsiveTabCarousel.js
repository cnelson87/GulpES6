/*
	TITLE: ResponsiveTabCarousel

	DESCRIPTION: Subclass of ResponsiveTabCarousel adds tab navigation
	NOTE: The tabs only work if mobile/tablet/desktop views all display one 'panel' at a time.

	VERSION: 0.5.0

	USAGE: const myTabCarousel = new ResponsiveTabCarousel('Element', 'Options')
		@param {jQuery Object}
		@param {Object}

	DEPENDENCIES:
		- jquery 3.x
		- greensock
		- ResponsiveCarousel.js

*/

import Constants from 'config/Constants';
import ResponsiveCarousel from 'widgets/ResponsiveCarousel';

class ResponsiveTabCarousel extends ResponsiveCarousel {

	initialize($el, options) {

		let subclassOptions = Object.assign({
			initialIndex: 0,
			numVisibleItemsMobile: 1,
			numItemsToAnimateMobile: 1,
			numVisibleItemsTablet: 1,
			numItemsToAnimateTablet: 1,
			numVisibleItemsDesktop: 1,
			numItemsToAnimateDesktop: 1,
			selectorTabs: '.carousel--tabnav a',
			classActiveNav: 'is-active',
			selectedText: 'currently selected',
			customEventPrefix: 'ResponsiveTabCarousel'
		}, options);

		// elements
		this.$tabs = $el.find(subclassOptions.selectorTabs);

		// properties
		this.selectedLabel = `<span class="sr-only selected-text"> - ${subclassOptions.selectedText}</span>`;

		super.initialize($el, subclassOptions);
	}


/**
*	Private Methods
**/

	initDOM() {
		const $activeTab = this.$tabs.eq(this.state.currentIndex);
		this.$tabs.attr({'role': 'tab', 'tabindex': '0', 'aria-selected': 'false'});
		$activeTab.addClass(this.options.classActiveNav).attr({'aria-selected': 'true'});
		$activeTab.append(this.selectedLabel);
		super.initDOM();
	}

	uninitDOM() {
		this.$tabs.removeAttr('role tabindex aria-selected').removeClass(this.options.classActiveNav);
		this.$tabs.find('.selected-text').remove();
		super.uninitDOM();
	}

	_addEventListeners() {
		this.$tabs.on('click', this.__clickTab.bind(this));
		this.$tabs.on('keydown', this.__keydownTab.bind(this));
		super._addEventListeners();
	}

	_removeEventListeners() {
		this.$tabs.off('click', this.__clickTab.bind(this));
		this.$tabs.off('keydown', this.__keydownTab.bind(this));
		super._removeEventListeners();
	}


/**
*	Event Handlers
**/

	__clickTab(event) {
		event.preventDefault();
		const { classNavDisabled } = this.options;
		const index = this.$tabs.index(event.currentTarget);
		const $currentTab = this.$tabs.eq(index);
		const $currentPanel = this.$panels.eq(index);

		if (this.state.isAnimating || $currentTab.hasClass(classNavDisabled)) {return;}

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

	updateNav() {
		const { classActiveNav } = this.options;
		const $inactiveTab = this.$tabs.filter('.'+classActiveNav);
		const $activeTab = this.$tabs.eq(this.state.currentIndex);

		$inactiveTab.removeClass(classActiveNav).attr({'aria-selected': 'false'});
		$activeTab.addClass(classActiveNav).attr({'aria-selected': 'true'});
		$inactiveTab.find('.selected-text').remove();
		$activeTab.append(this.selectedLabel);

		super.updateNav();
	}

}

export default ResponsiveTabCarousel;
