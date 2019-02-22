/*
	TITLE: ResponsiveTabCarousel

	DESCRIPTION: Subclass of ResponsiveTabCarousel adds tab navigation
	NOTE: The tabs only work if mobile/tablet/desktop views all display one 'panel' at a time.

	VERSION: 0.3.3

	USAGE: let myTabCarousel = new ResponsiveTabCarousel('Element', 'Options')
		@param {jQuery Object}
		@param {Object}

	AUTHOR: Chris Nelson <cnelson87@gmail.com>

	DEPENDENCIES:
		- jquery 3.x
		- greensock

*/

import Constants from 'config/Constants';
import ResponsiveCarousel from 'widgets/ResponsiveCarousel';

class ResponsiveTabCarousel extends ResponsiveCarousel {

	initialize($el, options) {

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
			selectorTabs: '.carousel--tabnav a',
			classActiveNav: 'is-active',
			selectedText: 'currently selected',
			customEventPrefix: 'ResponsiveTabCarousel'
		}, options);

		// element references
		this.$tabs = this.$el.find(this.options.selectorTabs);

		// setup & properties
		this.selectedLabel = `<span class="offscreen selected-text"> - ${this.options.selectedText}</span>`;

		super.initialize($el, this.options);
	}


/**
*	Private Methods
**/

	initDOM() {
		let $activeTab = this.$tabs.eq(this.currentIndex);
		this.$tabs.attr({'role':'tab', 'tabindex':'0', 'aria-selected':'false'});
		$activeTab.addClass(this.options.classActiveNav).attr({'aria-selected':'true'});
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
		let index = this.$tabs.index(event.currentTarget);
		let $currentTab = this.$tabs.eq(index);
		let $currentPanel = this.$panels.eq(index);

		if (this.isAnimating || $currentTab.hasClass(this.options.classNavDisabled)) {return;}

		if (this.options.autoRotate) {
			clearInterval(this.setAutoRotation);
			this.options.autoRotate = false;
		}

		if (this.currentIndex === index) {
			this.focusOnPanel($currentPanel);
		} else {
			this.currentIndex = index;
			this.updateCarousel(event);
		}

	}

	__keydownTab(event) {
		const { keys } = Constants;
		let keyCode = event.which;
		let index = this.$tabs.index(event.currentTarget);

		// left/up arrow; emulate tabbing to previous tab
		if (keyCode === keys.left || keyCode === keys.up) {
			event.preventDefault();
			if (index === 0) {index = this._length;}
			index--;
			this.$tabs.eq(index).focus();
		}

		// right/down arrow; emulate tabbing to next tab
		if (keyCode === keys.right || keyCode === keys.down) {
			event.preventDefault();
			index++;
			if (index === this._length) {index = 0;}
			this.$tabs.eq(index).focus();
		}

		// home key; emulate jump-tabbing to first tab
		if (keyCode === keys.home) {
			event.preventDefault();
			index = 0;
			this.$tabs.eq(index).focus();
		}

		// end key; emulate jump-tabbing to last tab
		if (keyCode === keys.end) {
			event.preventDefault();
			index = this._length - 1;
			this.$tabs.eq(index).focus();
		}

		// spacebar; activate tab click
		if (keyCode === keys.space) {
			event.preventDefault();
			this.$tabs.eq(index).click();
		}

	}


/**
*	Public Methods
**/

	updateNav() {
		let $inactiveTab = this.$tabs.filter('.'+this.options.classActiveNav);
		let $activeTab = this.$tabs.eq(this.currentIndex);

		$inactiveTab.removeClass(this.options.classActiveNav).attr({'aria-selected':'false'});
		$activeTab.addClass(this.options.classActiveNav).attr({'aria-selected':'true'});
		$inactiveTab.find('.selected-text').remove();
		$activeTab.append(this.selectedLabel);

		super.updateNav();

	}

}

export default ResponsiveTabCarousel;
