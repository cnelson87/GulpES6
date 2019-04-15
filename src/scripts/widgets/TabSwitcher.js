/*
	TITLE: TabSwitcher

	DESCRIPTION: Basic TabSwitcher widget

	VERSION: 0.4.0

	USAGE: let myTabSwitcher = new TabSwitcher('Element', 'Options')
		@param {jQuery Object}
		@param {Object}

	DEPENDENCIES:
		- jquery 3.x
		- HeightEqualizer.js

*/

import Constants from 'config/Constants';
import Events from 'config/Events';
import focusOnContentEl from 'utilities/focusOnContentEl';
import HeightEqualizer from 'widgets/HeightEqualizer';

class TabSwitcher {

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
			selectorTabs: '.tabswitcher--tabnav a',
			selectorPanels: '.tabswitcher--panel',
			classActive: 'is-active',
			classDisabled: 'is-disabled',
			classInitialized: 'is-initialized',
			equalizeHeight: false,
			autoRotate: false,
			autoRotateInterval: Constants.timing.interval,
			maxAutoRotations: 5,
			animDuration: Constants.timing.standard,
			selectorFocusEls: Constants.focusableElements,
			selectedText: 'currently selected',
			enableTracking: false,
			customEventPrefix: 'TabSwitcher'
		}, options);

		// elements
		this.$tabs = this.$el.find(this.options.selectorTabs);
		this.$panels = this.$el.find(this.options.selectorPanels);

		// properties
		this._length = this.$panels.length;
		if (this.options.initialIndex >= this._length) {this.options.initialIndex = 0;}
		this.heightEqualizer = null;
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
		let $activeTab = this.$tabs.eq(this.state.currentIndex);
		let $activePanel = this.$panels.eq(this.state.currentIndex);

		this.$el.attr({'role':'tablist', 'aria-live':'polite'});
		this.$tabs.attr({'role':'tab', 'tabindex':'0', 'aria-selected':'false'});
		this.$panels.attr({'role':'tabpanel', 'aria-hidden':'true'});
		this.$panels.find(this.options.selectorFocusEls).attr({'tabindex':'-1'});

		this.activateTab($activeTab);

		this.activatePanel($activePanel);

		// equalize items height
		if (this.options.equalizeHeight) {
			this.heightEqualizer = new HeightEqualizer(this.$el, {
				selectorItems: this.options.selectorPanels,
				setParentHeight: false
			});
		}

		// auto-rotate items
		if (this.options.autoRotate) {
			this.autoRotationCounter = this._length * this.options.maxAutoRotations;
			this.setAutoRotation = setInterval(() => {
				this.autoRotation();
			}, this.options.autoRotateInterval);
		}

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
		this.$panels.find(this.options.selectorFocusEls).removeAttr('tabindex');
		this.$tabs.find('.selected-text').remove();
		if (this.options.equalizeHeight) {
			this.heightEqualizer.unInitialize();
		}
		if (this.options.autoRotate) {
			clearInterval(this.setAutoRotation);
		}
	}

	_addEventListeners() {
		// this.$window.on('resize', this.__onWindowResize.bind(this));
		this.$tabs.on('click', this.__clickTab.bind(this));
		this.$tabs.on('keydown', this.__keydownTab.bind(this));
	}

	_removeEventListeners() {
		// this.$window.off('resize', this.__onWindowResize.bind(this));
		this.$tabs.off('click', this.__clickTab.bind(this));
		this.$tabs.off('keydown', this.__keydownTab.bind(this));
	}

	autoRotation() {
		this.state.previousIndex = this.state.currentIndex;
		this.state.currentIndex++;
		if (this.state.currentIndex === this._length) {this.state.currentIndex = 0;}

		this.switchPanels();
		this.autoRotationCounter--;

		if (this.autoRotationCounter === 0) {
			clearInterval(this.setAutoRotation);
			this.options.autoRotate = false;
		}

	}


/**
*	Event Handlers
**/

	// __onWindowResize(event) {
	//
	// }

	__clickTab(event) {
		event.preventDefault();
		if ($(event.target).hasClass('ignore-click')) {return;}
		let index = this.$tabs.index(event.currentTarget);
		let $currentTab = this.$tabs.eq(index);
		let $currentPanel = this.$panels.eq(index);

		if (this.state.isAnimating || $currentTab.hasClass(this.options.classDisabled)) {return;}

		if (this.options.autoRotate) {
			clearInterval(this.setAutoRotation);
			this.options.autoRotate = false;
		}

		if (this.state.currentIndex === index) {
			this.focusOnPanel($currentPanel);
		} else {
			this.state.previousIndex = this.state.currentIndex;
			this.state.currentIndex = index;
			this.switchPanels(event);
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

	switchPanels(event) {
		let $inactiveTab = this.$tabs.eq(this.state.previousIndex);
		let $activeTab = this.$tabs.eq(this.state.currentIndex);
		let $inactivePanel = this.$panels.eq(this.state.previousIndex);
		let $activePanel = this.$panels.eq(this.state.currentIndex);

		this.state.isAnimating = true;

		this.deactivateTab($inactiveTab);
		this.activateTab($activeTab);

		this.deactivatePanel($inactivePanel);
		this.activatePanel($activePanel);

		$.event.trigger(`${this.options.customEventPrefix}:panelPreClose`, {inactivePanel: $inactivePanel});
		$.event.trigger(`${this.options.customEventPrefix}:panelPreOpen`, {activePanel: $activePanel});

		setTimeout(() => {
			this.state.isAnimating = false;
			if (!!event) {
				this.focusOnPanel($activePanel);
			}
			$.event.trigger(`${this.options.customEventPrefix}:panelClosed`, {inactivePanel: $inactivePanel});
			$.event.trigger(`${this.options.customEventPrefix}:panelOpened`, {activePanel: $activePanel});
		}, this.options.animDuration);

		this.fireTracking();
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
		$panel.find(this.options.selectorFocusEls).attr({'tabindex':'-1'});
	}

	activatePanel($panel) {
		$panel.addClass(this.options.classActive).attr({'aria-hidden':'false'});
		$panel.find(this.options.selectorFocusEls).attr({'tabindex':'0'});
	}

	focusOnPanel($panel) {
		let index = this.$panels.index($panel);
		let extraTopOffset = this.$tabs.eq(index).outerHeight();
		focusOnContentEl($panel, extraTopOffset);
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

export default TabSwitcher;
