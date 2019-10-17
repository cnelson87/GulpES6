/*
	TITLE: Accordion

	DESCRIPTION: Basic Accordion widget

	VERSION: 0.4.0

	USAGE: let myAccordion = new Accordion('Element', 'Options')
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
		let urlHash = location.hash.substring(1) || null;

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
			selfClosing: true,
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
		this.$panels.find(this.options.selectorFocusEls).attr({'tabindex':'-1'});

		this.activateTab($activeTab);

		this.activatePanel($activePanel);

		// equalize items height
		if (this.options.equalizeHeight) {
			this.heightEqualizer = new HeightEqualizer(this.$el, {
				selectorItems: this.options.selectorPanels,
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
		TweenMax.set(this.$panels, {
			display: '',
			height: ''
		});
		if (this.options.equalizeHeight) {
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
		let index = this.$tabs.index(event.currentTarget);
		let $currentTab = this.$tabs.eq(index);
		let $currentPanel = this.$panels.eq(index);

		if (this.state.isAnimating || $currentTab.hasClass(this.options.classDisabled)) {return;}

		// if selfClosing then check various states of acordion
		if (this.options.selfClosing) {

			// currentIndex is open
			if (this.state.currentIndex === index) {
				this.state.previousIndex = null;
				this.state.currentIndex = -1;
				this.animateClosed(index);

			// currentIndex is -1, all are closed
		} else if (this.state.currentIndex === -1) {
				this.state.previousIndex = null;
				this.state.currentIndex = index;
				this.animateOpen(index);

			// default behaviour
			} else {
				this.state.previousIndex = this.state.currentIndex;
				this.state.currentIndex = index;
				this.animateClosed(this.state.previousIndex);
				this.animateOpen(this.state.currentIndex);
			}

		// else accordion operates as normal
		} else {

			if (this.currentIndex === index) {
				this.focusOnPanel($currentPanel);
			} else {
				this.state.previousIndex = this.state.currentIndex;
				this.state.currentIndex = index;
				this.animateClosed(this.state.previousIndex);
				this.animateOpen(this.state.currentIndex);
			}

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

	animateClosed(index) {
		let self = this;
		let $inactiveTab = this.$tabs.eq(index);
		let $inactivePanel = this.$panels.eq(index);

		this.state.isAnimating = true;

		this.deactivateTab($inactiveTab);

		this.deactivatePanel($inactivePanel);

		$.event.trigger(`${this.options.customEventPrefix}:panelPreClose`, {inactivePanel: $inactivePanel});

		TweenMax.to($inactivePanel, this.options.animDuration, {
			height: 0,
			ease: this.options.animEasing,
			onUpdate: function() {
				$.event.trigger(`${self.options.customEventPrefix}:panelClosing`, {inactivePanel: $inactivePanel});
			},
			onComplete: function() {
				self.state.isAnimating = false;
				$inactiveTab.focus();
				TweenMax.set($inactivePanel, {
					display: 'none',
					height: self.maxHeight
				});
				$.event.trigger(`${self.options.customEventPrefix}:panelClosed`, {inactivePanel: $inactivePanel});
			}
		});

	}

	animateOpen(index) {
		let self = this;
		let $activeTab = this.$tabs.eq(index);
		let $activePanel = this.$panels.eq(index);
		let panelHeight = $activePanel.outerHeight();

		this.state.isAnimating = true;

		this.activateTab($activeTab);

		this.activatePanel($activePanel);

		if (this.options.equalizeHeight) {
			panelHeight = this.maxHeight;
			TweenMax.set($activePanel, {
				height: 0
			});
		}

		$.event.trigger(`${this.options.customEventPrefix}:panelPreOpen`, {activePanel: $activePanel});

		TweenMax.to($activePanel, this.options.animDuration, {
			display: 'block',
			height: panelHeight,
			ease: this.options.animEasing,
			onUpdate: function() {
				$.event.trigger(`${self.options.customEventPrefix}:panelOpening`, {activePanel: $activePanel});
			},
			onComplete: function() {
				self.state.isAnimating = false;
				self.focusOnPanel($activePanel);
				TweenMax.set($activePanel, {
					height: self.maxHeight
				});
				$.event.trigger(`${self.options.customEventPrefix}:panelOpened`, {activePanel: $activePanel});
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

export default Accordion;
