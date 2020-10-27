/*
	TITLE: Accordion

	DESCRIPTION: Basic Accordion widget

	VERSION: 0.5.0

	USAGE: const myAccordion = new Accordion('Element', 'Options')
		@param {jQuery Object}
		@param {Object}

	DEPENDENCIES:
		- jquery 3.x
		- greensock
		- HeightEqualizer.js

*/

import Constants from 'config/Constants';
import Events from 'config/Events';
import focusOnContentEl from 'utilities/focusOnContentEl';
import HeightEqualizer from 'widgets/HeightEqualizer';

class Accordion {

	constructor($el, options = {}) {
		this.$window = $(window);
		this.initialize($el, options);
	}

	initialize($el, options) {
		const urlHash = location.hash.substring(1) || null;

		// defaults
		this.$el = $el;
		this.options = Object.assign({
			initialIndex: 0,
			selectorTabs: '.accordion--header a',
			selectorPanels: '.accordion--panel',
			classActive: 'is-active',
			classDisabled: 'is-disabled',
			classInitialized: 'is-initialized',
			equalizeHeight: false,
			enableAllClosed: true,
			animDuration: (Constants.timing.standard / 1000),
			animEasing: 'Power4.easeOut',
			selectorFocusEls: Constants.focusableElements,
			selectedText: 'currently selected',
			enableTracking: false,
			customEventPrefix: 'Accordion'
		}, options);

		// elements
		this.$tabs = this.$el.find(this.options.selectorTabs);
		this.$panels = this.$el.find(this.options.selectorPanels);

		// properties
		this._length = this.$panels.length;
		if (this.options.initialIndex >= this._length) {this.options.initialIndex = 0;}
		this.heightEqualizer = null;
		this.maxHeight = 'auto';
		this.selectedLabel = `<span class="sr-only selected-text"> - ${this.options.selectedText}</span>`;

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
		const { classInitialized, selectorFocusEls, selectorPanels, equalizeHeight } = this.options;
		const highIndex = 9999;
		const $activeTab = this.$tabs.eq(this.state.currentIndex === -1 ? highIndex : this.state.currentIndex);
		const $activePanel = this.$panels.eq(this.state.currentIndex === -1 ? highIndex : this.state.currentIndex);

		this.$el.attr({'role': 'tablist', 'aria-live': 'polite'});
		this.$tabs.attr({'role': 'tab', 'tabindex': '0', 'aria-selected': 'false'});
		this.$panels.attr({'role': 'tabpanel', 'aria-hidden': 'true'});
		this.$panels.find(selectorFocusEls).attr({'tabindex': '-1'});

		this.activateTab($activeTab);

		this.activatePanel($activePanel);

		// equalize items height
		if (equalizeHeight) {
			this.heightEqualizer = new HeightEqualizer(this.$el, {
				selectorItems: selectorPanels,
				setParentHeight: false
			});
			this.maxHeight = this.heightEqualizer.maxHeight;
		}

		TweenMax.set(this.$panels, {
			display: 'none',
			height: this.maxHeight
		});

		TweenMax.set($activePanel, {
			display: 'block',
			height: this.maxHeight
		});

		this.$el.addClass(classInitialized);

		// initial focus on content
		this.$window.on('load', () => {
			if (this.setInitialFocus) {
				this.focusOnPanel($activePanel);
			}
		});

	}

	uninitDOM() {
		const { classInitialized, classActive, selectorFocusEls, equalizeHeight } = this.options;
		this.$el.removeAttr('role aria-live').removeClass(classInitialized);
		this.$tabs.removeAttr('role tabindex aria-selected').removeClass(classActive);
		this.$panels.removeAttr('role aria-hidden').removeClass(classActive);
		this.$panels.find(selectorFocusEls).removeAttr('tabindex');
		this.$tabs.find('.selected-text').remove();
		TweenMax.set(this.$panels, {
			display: '',
			height: ''
		});
		if (equalizeHeight) {
			this.heightEqualizer.unInitialize();
		}
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
		if (this.options.equalizeHeight) {
			this.maxHeight = this.heightEqualizer.maxHeight;
		}
	}

	__clickTab(event) {
		event.preventDefault();
		if ($(event.target).hasClass('ignore-click')) {return;}
		const { classDisabled, enableAllClosed } = this.options;
		const index = this.$tabs.index(event.currentTarget);
		const $currentTab = this.$tabs.eq(index);
		const $currentPanel = this.$panels.eq(index);

		if (this.state.isAnimating || $currentTab.hasClass(classDisabled)) {return;}

		// if enableAllClosed then check various states of accordion
		if (enableAllClosed) {

			// currentIndex is open
			if (this.state.currentIndex === index) {
				this.state.previousIndex = null;
				this.state.currentIndex = -1;
				this.animateClosed(index);
			}
			// currentIndex is -1, all are closed
			else if (this.state.currentIndex === -1) {
				this.state.previousIndex = null;
				this.state.currentIndex = index;
				this.animateOpen(index);
			}
			// default behaviour
			else {
				this.state.previousIndex = this.state.currentIndex;
				this.state.currentIndex = index;
				this.animateClosed(this.state.previousIndex);
				this.animateOpen(this.state.currentIndex);
			}

		}
		// else accordion operates as normal
		else {

			// currentIndex is open
			if (this.currentIndex === index) {
				this.focusOnPanel($currentPanel);
			}
			// default behaviour
			else {
				this.state.previousIndex = this.state.currentIndex;
				this.state.currentIndex = index;
				this.animateClosed(this.state.previousIndex);
				this.animateOpen(this.state.currentIndex);
			}

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

	animateClosed(index) {
		const self = this;
		const { animDuration, animEasing, customEventPrefix } = this.options;
		const $inactiveTab = this.$tabs.eq(index);
		const $inactivePanel = this.$panels.eq(index);

		this.state.isAnimating = true;

		this.deactivateTab($inactiveTab);

		this.deactivatePanel($inactivePanel);

		$.event.trigger(`${customEventPrefix}:panelPreClose`, {inactivePanel: $inactivePanel});

		TweenMax.to($inactivePanel, animDuration, {
			height: 0,
			ease: animEasing,
			onUpdate: function() {
				$.event.trigger(`${customEventPrefix}:panelClosing`, {inactivePanel: $inactivePanel});
			},
			onComplete: function() {
				self.state.isAnimating = false;
				$inactiveTab.focus();
				TweenMax.set($inactivePanel, {
					display: 'none',
					height: self.maxHeight
				});
				$.event.trigger(`${customEventPrefix}:panelClosed`, {inactivePanel: $inactivePanel});
			}
		});

	}

	animateOpen(index) {
		const self = this;
		const { animDuration, animEasing, equalizeHeight, customEventPrefix } = this.options;
		const $activeTab = this.$tabs.eq(index);
		const $activePanel = this.$panels.eq(index);
		let panelHeight = $activePanel.outerHeight();

		this.state.isAnimating = true;

		this.activateTab($activeTab);

		this.activatePanel($activePanel);

		if (equalizeHeight) {
			panelHeight = this.maxHeight;
			TweenMax.set($activePanel, {
				height: 0
			});
		}

		$.event.trigger(`${customEventPrefix}:panelPreOpen`, {activePanel: $activePanel});

		TweenMax.to($activePanel, animDuration, {
			display: 'block',
			height: panelHeight,
			ease: animEasing,
			onUpdate: function() {
				$.event.trigger(`${customEventPrefix}:panelOpening`, {activePanel: $activePanel});
			},
			onComplete: function() {
				self.state.isAnimating = false;
				self.focusOnPanel($activePanel);
				TweenMax.set($activePanel, {
					height: self.maxHeight
				});
				$.event.trigger(`${customEventPrefix}:panelOpened`, {activePanel: $activePanel});
			}
		});

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
		const index = this.$panels.index($panel);
		const extraTopOffset = this.$tabs.eq(index).outerHeight();
		focusOnContentEl($panel, extraTopOffset);
	}

	fireTracking() {
		if (!this.options.enableTracking) {return;}
		const $activePanel = this.$panels.eq(this.state.currentIndex);
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

export default Accordion;
