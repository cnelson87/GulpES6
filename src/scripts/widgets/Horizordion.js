/*
	TITLE: Horizordion

	DESCRIPTION: A horizontal Accordion

	VERSION: 0.2.0

	USAGE: let myHorizordion = new Horizordion('Element', 'Options')
		@param {jQuery Object}
		@param {Object}

	DEPENDENCIES:
		- jquery 3.x

*/

import Constants from 'config/Constants';
import Events from 'config/Events';
import focusOnContentEl from 'utilities/focusOnContentEl';

class Horizordion {

	constructor($el, options = {}) {
		this.$window = $(window);
		this.initialize($el, options);
	}

	initialize($el, options) {
		let urlHash = location.hash.substring(1) || null;

		// defaults
		this.$el = $el;
		this.options = Object.assign({
			initialIndex: 0,
			selectorTabs: '.horizordion--tab a',
			selectorPanels: '.horizordion--panel',
			selectorContent: '.horizordion--content',
			classActive: 'is-active',
			classDisabled: 'is-disabled',
			classInitialized: 'is-initialized',
			animDuration: Constants.timing.standard,
			selectorFocusEls: Constants.focusableElements,
			selectedText: 'currently selected',
			enableTracking: false,
			customEventPrefix: 'Horizordion'
		}, options);

		// elements
		this.$tabs = this.$el.find(this.options.selectorTabs);
		this.$panels = this.$el.find(this.options.selectorPanels);

		// properties
		this._length = this.$panels.length;
		if (this.options.initialIndex >= this._length) {this.options.initialIndex = 0;}
		this.selectedLabel = `<span class="offscreen selected-text"> - ${this.options.selectedText}</span>`;

		// state
		this.state = {
			currentIndex: this.options.initialIndex,
			previousIndex: null,
			isAnimating: false,
		};

		// check url hash to override currentIndex
		this.setInitialFocus = false;
		if (urlHash) {
			for (let i=0; i<this._length; i++) {
				if (this.$panels.eq(i).data('id') === urlHash) {
					this.state.currentIndex = i;
					this.setInitialFocus = true;
					break;
				}
			}
		}

		this.initDOM();

		this._addEventListeners();

		$.event.trigger(`${this.options.customEventPrefix}:isInitialized`, [this.$el]);

	}


/**
*	Private Methods
**/

	initDOM() {
		let highIndex = 9999;
		let $activeTab = this.$tabs.eq(this.state.currentIndex === -1 ? highIndex : this.state.currentIndex);
		let $activePanel = this.$panels.eq(this.state.currentIndex === -1 ? highIndex : this.state.currentIndex);

		this.$el.attr({'role':'tablist', 'aria-live':'polite'});
		this.$tabs.attr({'role':'tab', 'tabindex':'0', 'aria-selected':'false'});
		this.$panels.attr({'role':'tabpanel', 'aria-hidden':'true'});
		this.$panels.find(this.options.selectorContent).find(this.options.selectorFocusEls).attr({'tabindex':'-1'});

		this.activateTab($activeTab);

		this.activatePanel($activePanel);

		this.$el.addClass(this.options.classInitialized);

		// initial focus on content
		this.$window.on('load', () => {
			if (this.setInitialFocus) {
				this.focusOnPanel($activePanel);
			}
		});

	}

	uninitDOM() {
		this.$el.removeAttr('role aria-live').removeClass(this.options.classInitialized);
		this.$tabs.removeAttr('role tabindex aria-selected').removeClass(this.options.classActive);
		this.$panels.removeAttr('role aria-hidden').removeClass(this.options.classActive);
		this.$panels.find(this.options.selectorContent).find(this.options.selectorFocusEls).removeAttr('tabindex');
		this.$tabs.find('.selected-text').remove();
	}

	_addEventListeners() {
		this.$window.on('resize', this.__onWindowResize.bind(this));
		this.$tabs.on('click', this.__clickTab.bind(this));
		this.$tabs.on('keydown', this.__keydownTab.bind(this));
	}

	_removeEventListeners() {
		this.$window.off('resize', this.__onWindowResize.bind(this));
		this.$tabs.off('click', this.__clickTab.bind(this));
		this.$tabs.off('keydown', this.__keydownTab.bind(this));
	}


/**
*	Event Handlers
**/

	__onWindowResize(event) {
		console.log('__onWindowResize');
	}

	__clickTab(event) {
		event.preventDefault();
		let index = this.$tabs.index(event.currentTarget);
		let $currentTab = this.$tabs.eq(index);
		// let $currentPanel = this.$panels.eq(index);

		if (this.isAnimating || $currentTab.hasClass(this.options.classDisabled)) {return;}

		// currentIndex is open
		if (this.state.currentIndex === index) {
			this.state.previousIndex = null;
			this.state.currentIndex = -1;
			this.closePanel(index);

		// currentIndex is -1, all are closed
	} else if (this.state.currentIndex === -1) {
			this.state.previousIndex = null;
			this.state.currentIndex = index;
			this.openPanel(index);

		// default behaviour
		} else {
			this.state.previousIndex = this.state.currentIndex;
			this.state.currentIndex = index;
			this.closePanel(this.state.previousIndex);
			this.openPanel(this.state.currentIndex);
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

	closePanel(index) {
		let $inactiveTab = this.$tabs.eq(index);
		let $inactivePanel = this.$panels.eq(index);

		this.isAnimating = true;

		this.deactivateTab($inactiveTab);

		this.deactivatePanel($inactivePanel);

		setTimeout(() => {
			this.isAnimating = false;
			$inactiveTab.focus();
		}, this.options.animDuration);

	}

	openPanel(index) {
		let $activeTab = this.$tabs.eq(index);
		let $activePanel = this.$panels.eq(index);

		this.isAnimating = true;

		this.activateTab($activeTab);

		this.activatePanel($activePanel);

		setTimeout(() => {
			this.isAnimating = false;
			this.focusOnPanel($activePanel);
		}, this.options.animDuration);

	}

	deactivateTab($tab) {
		$tab.removeClass(this.options.classActive).attr({'aria-selected':'false'});
		$tab.find('.selected-text').remove();
	}

	activateTab($tab) {
		$tab.addClass(this.options.classActive).attr({'aria-selected':'true'});
		$tab.append(this.selectedLabel);
	}

	deactivatePanel($panel) {
		$panel.removeClass(this.options.classActive).attr({'aria-hidden':'true'});
		$panel.find(this.options.selectorContent).find(this.options.selectorFocusEls).attr({'tabindex':'-1'});
	}

	activatePanel($panel) {
		$panel.addClass(this.options.classActive).attr({'aria-hidden':'false'});
		$panel.find(this.options.selectorContent).find(this.options.selectorFocusEls).attr({'tabindex':'0'});
	}

	focusOnPanel($panel) {
		focusOnContentEl($panel);
	}

	fireTracking() {
		if (!this.options.enableTracking) {return;}
		let $activePanel = this.$panels.eq(this.state.currentIndex);
		$.event.trigger(Events.TRACKING_STATE, [$activePanel]);
	}

	unInitialize() {
		this._removeEventListeners();
		this.uninitDOM();
		this.$el = null;
		this.$tabs = null;
		this.$panels = null;
		$.event.trigger(`${this.options.customEventPrefix}:unInitialized`);
	}

}

export default Horizordion;
