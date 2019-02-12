/*
	TITLE: MiniAccordion

	DESCRIPTION: A single Accordion item

	VERSION: 0.3.9

	USAGE: let myAccordion = new MiniAccordion('Element', 'Options')
		@param {jQuery Object}
		@param {Object}

	AUTHOR: Chris Nelson <cnelson87@gmail.com>

	DEPENDENCIES:
		- jquery 3.x
		- greensock

*/

import AppConfig from 'config/AppConfig';
import AppEvents from 'config/AppEvents';
import focusOnContentEl from 'utilities/focusOnContentEl';

class MiniAccordion {

	constructor($el, options = {}) {
		this.$window = $(window);
		this.initialize($el, options);
	}

	initialize($el, options) {
		let urlHash = location.hash.substring(1) || null;

		// defaults
		this.$el = $el;
		this.options = Object.assign({
			initialOpen: false,
			selectorTabs: '.accordion--header a',
			selectorPanels: '.accordion--panel',
			classActive: 'is-active',
			animDuration: (AppConfig.timing.standard / 1000),
			animEasing: 'Power4.easeOut',
			selectorFocusEls: AppConfig.focusableElements,
			selectedText: 'currently selected',
			enableTracking: false,
			customEventPrefix: 'MiniAccordion'
		}, options);

		// element references
		this.$tab = this.$el.find(this.options.selectorTabs);
		this.$panel = this.$el.find(this.options.selectorPanels);

		// setup & properties
		this.isActive = this.options.initialOpen;
		this.isAnimating = false;
		this.selectedLabel = `<span class="offscreen selected-text"> - ${this.options.selectedText}</span>`;

		// check url hash to override isActive
		this.setInitialFocus = false;
		if (urlHash && this.$panel.data('id') === urlHash) {
			this.isActive = true;
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

		this.$el.attr({'role':'tablist', 'aria-live':'polite'});
		this.$tab.attr({'role':'tab', 'tabindex':'0', 'aria-selected':'false'});
		this.$panel.attr({'role':'tabpanel', 'aria-hidden':'true'});
		this.$panel.find(this.options.selectorFocusEls).attr({'tabindex':'-1'});

		if (this.isActive) {
			this.activateTab();
			this.activatePanel();
		}

		TweenMax.set(this.$panel, {
			display: this.isActive ? 'block' : 'none',
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
		if (this.isAnimating) {return;}

		if (this.isActive) {
			this.animateClosed();
		} else {
			this.animateOpen();
		}

	}

	__keydownTab(event) {
		const { keys } = AppConfig;
		let keyCode = event.which;

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
		let self = this;

		this.isAnimating = true;

		this.isActive = false;

		this.deactivateTab();

		this.deactivatePanel();

		$.event.trigger(`${this.options.customEventPrefix}:panelPreClose`, [this.$panel]);

		TweenMax.to(this.$panel, this.options.animDuration, {
			height: 0,
			ease: this.options.animEasing,
			onUpdate: function() {
				$.event.trigger(`${self.options.customEventPrefix}:panelClosing`, [self.$panel]);
			},
			onComplete: function() {
				self.isAnimating = false;
				self.$tab.focus();
				TweenMax.set(self.$panel, {
					display: 'none',
					height: 'auto'
				});
				$.event.trigger(`${self.options.customEventPrefix}:panelClosed`, [self.$panel]);
			}
		});

	}

	animateOpen() {
		let self = this;
		let panelHeight = this.$panel.outerHeight();

		this.isAnimating = true;

		this.isActive = true;

		this.activateTab();

		this.activatePanel();

		$.event.trigger(`${this.options.customEventPrefix}:panelPreOpen`, [this.$panel]);

		TweenMax.to(this.$panel, this.options.animDuration, {
			display: 'block',
			height: panelHeight,
			ease: this.options.animEasing,
			onUpdate: function() {
				$.event.trigger(`${self.options.customEventPrefix}:panelOpening`, [self.$panel]);
			},
			onComplete: function() {
				self.isAnimating = false;
				self.focusOnPanel(self.$panel);
				TweenMax.set(self.$panel, {
					height: 'auto'
				});
				$.event.trigger(`${self.options.customEventPrefix}:panelOpened`, [self.$panel]);
			}
		});

		this.fireTracking();
	}

	deactivateTab() {
		this.$tab.removeClass(this.options.classActive).attr({'aria-selected':'false'});
		this.$tab.find('.selected-text').remove();
	}

	activateTab() {
		this.$tab.addClass(this.options.classActive).attr({'aria-selected':'true'});
		this.$tab.append(this.selectedLabel);
	}

	deactivatePanel() {
		this.$panel.removeClass(this.options.classActive).attr({'aria-hidden':'true'});
		this.$panel.find(this.options.selectorFocusEls).attr({'tabindex':'-1'});
	}

	activatePanel() {
		this.$panel.addClass(this.options.classActive).attr({'aria-hidden':'false'});
		this.$panel.find(this.options.selectorFocusEls).attr({'tabindex':'0'});
	}

	focusOnPanel($panel) {
		let extraTopOffset = this.$tab.outerHeight();
		focusOnContentEl($panel, extraTopOffset);
	}

	fireTracking() {
		if (!this.options.enableTracking) {return;}
		$.event.trigger(AppEvents.TRACKING_STATE, [this.$el]);
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
