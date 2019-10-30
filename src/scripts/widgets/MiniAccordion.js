/*
	TITLE: MiniAccordion

	DESCRIPTION: A single Accordion item

	VERSION: 0.5.0

	USAGE: const myAccordion = new MiniAccordion('Element', 'Options')
		@param {jQuery Object}
		@param {Object}

	DEPENDENCIES:
		- jquery 3.x
		- greensock

*/

import Constants from 'config/Constants';
import Events from 'config/Events';
import focusOnContentEl from 'utilities/focusOnContentEl';

class MiniAccordion {

	constructor($el, options = {}) {
		this.$window = $(window);
		this.initialize($el, options);
	}

	initialize($el, options) {
		const urlHash = location.hash.substring(1) || null;

		// defaults
		this.$el = $el;
		this.options = Object.assign({
			initialOpen: false,
			selectorTabs: '.accordion--header a',
			selectorPanels: '.accordion--panel',
			classActive: 'is-active',
			animDuration: (Constants.timing.standard / 1000),
			animEasing: 'Power4.easeOut',
			selectorFocusEls: Constants.focusableElements,
			selectedText: 'currently selected',
			enableTracking: false,
			customEventPrefix: 'MiniAccordion'
		}, options);

		// elements
		this.$tab = this.$el.find(this.options.selectorTabs);
		this.$panel = this.$el.find(this.options.selectorPanels);

		// properties
		this.selectedLabel = `<span class="sr-only selected-text"> - ${this.options.selectedText}</span>`;

		// state
		this.state = {
			isActive: this.options.initialOpen,
			isAnimating: false,
		};

		// check url hash to override isActive
		this.setInitialFocus = false;
		if (urlHash && this.$panel.data('id') === urlHash) {
			this.state.isActive = true;
			this.setInitialFocus = true;
		}

		this.initDOM();

		this._addEventListeners();

		$.event.trigger(`${this.options.customEventPrefix}:isInitialized`, [this.$el]);

	}


/**
*	Private Methods
**/

	initDOM() {

		this.$el.attr({'role': 'tablist', 'aria-live': 'polite'});
		this.$tab.attr({'role': 'tab', 'tabindex': '0', 'aria-selected': 'false'});
		this.$panel.attr({'role': 'tabpanel', 'aria-hidden': 'true'});
		this.$panel.find(this.options.selectorFocusEls).attr({'tabindex': '-1'});

		if (this.state.isActive) {
			this.activateTab();
			this.activatePanel();
		}

		TweenMax.set(this.$panel, {
			display: this.state.isActive ? 'block' : 'none',
			height: 'auto'
		});

		// initial focus on content
		this.$window.on('load', () => {
			if (this.setInitialFocus) {
				this.focusOnPanel(this.$panel);
			}
		});

	}

	uninitDOM() {

		this.$el.removeAttr('role aria-live');
		this.$tab.removeAttr('role tabindex aria-selected').removeClass(this.options.classActive);
		this.$panel.removeAttr('role aria-hidden').removeClass(this.options.classActive);
		this.$panel.find(this.options.selectorFocusEls).removeAttr('tabindex');
		this.$tab.find('.selected-text').remove();

		TweenMax.set(this.$panel, {
			display: '',
			height: ''
		});

	}

	_addEventListeners() {
		this.$tab.on('click', this.__clickTab.bind(this));
		this.$tab.on('keydown', this.__keydownTab.bind(this));
	}

	_removeEventListeners() {
		this.$tab.off('click', this.__clickTab.bind(this));
		this.$tab.off('keydown', this.__keydownTab.bind(this));
	}


/**
*	Event Handlers
**/

	__clickTab(event) {
		event.preventDefault();
		if ($(event.target).hasClass('ignore-click')) {return;}
		if (this.state.isAnimating) {return;}

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
			this.$tab.click();
		}

	}


/**
*	Public Methods
**/

	animateClosed() {
		const self = this;
		const { animDuration, animEasing, customEventPrefix } = this.options;

		this.state.isAnimating = true;

		this.state.isActive = false;

		this.deactivateTab();

		this.deactivatePanel();

		$.event.trigger(`${customEventPrefix}:panelPreClose`, [this.$panel]);

		TweenMax.to(this.$panel, animDuration, {
			height: 0,
			ease: animEasing,
			onUpdate: function() {
				$.event.trigger(`${customEventPrefix}:panelClosing`, [self.$panel]);
			},
			onComplete: function() {
				self.state.isAnimating = false;
				self.$tab.focus();
				TweenMax.set(self.$panel, {
					display: 'none',
					height: 'auto'
				});
				$.event.trigger(`${customEventPrefix}:panelClosed`, [self.$panel]);
			}
		});

	}

	animateOpen() {
		const self = this;
		const { animDuration, animEasing, customEventPrefix } = this.options;
		const panelHeight = this.$panel.outerHeight();

		this.state.isAnimating = true;

		this.state.isActive = true;

		this.activateTab();

		this.activatePanel();

		$.event.trigger(`${customEventPrefix}:panelPreOpen`, [this.$panel]);

		TweenMax.to(this.$panel, animDuration, {
			display: 'block',
			height: panelHeight,
			ease: animEasing,
			onUpdate: function() {
				$.event.trigger(`${customEventPrefix}:panelOpening`, [self.$panel]);
			},
			onComplete: function() {
				self.state.isAnimating = false;
				self.focusOnPanel(self.$panel);
				TweenMax.set(self.$panel, {
					height: 'auto'
				});
				$.event.trigger(`${customEventPrefix}:panelOpened`, [self.$panel]);
			}
		});

		this.fireTracking();
	}

	deactivateTab() {
		this.$tab.removeClass(this.options.classActive).attr({'aria-selected': 'false'});
		this.$tab.find('.selected-text').remove();
	}

	activateTab() {
		this.$tab.addClass(this.options.classActive).attr({'aria-selected': 'true'});
		this.$tab.append(this.selectedLabel);
	}

	deactivatePanel() {
		this.$panel.removeClass(this.options.classActive).attr({'aria-hidden': 'true'});
		this.$panel.find(this.options.selectorFocusEls).attr({'tabindex': '-1'});
	}

	activatePanel() {
		this.$panel.addClass(this.options.classActive).attr({'aria-hidden': 'false'});
		this.$panel.find(this.options.selectorFocusEls).attr({'tabindex': '0'});
	}

	focusOnPanel($panel) {
		const extraTopOffset = this.$tab.outerHeight();
		focusOnContentEl($panel, extraTopOffset);
	}

	fireTracking() {
		if (!this.options.enableTracking) {return;}
		$.event.trigger(Events.TRACKING_STATE, [this.$el]);
	}

	unInitialize() {
		this._removeEventListeners();
		this.uninitDOM();
		this.$el = null;
		this.$tab = null;
		this.$panel = null;
		$.event.trigger(`${this.options.customEventPrefix}:unInitialized`);
	}

}

export default MiniAccordion;
