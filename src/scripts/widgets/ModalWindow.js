/*
	TITLE: ModalWindow

	DESCRIPTION: Base class to create modal windows

	VERSION: 0.3.2

	USAGE: let myModalWindow = new ModalWindow('Options')
		@param {jQuery Object}
		@param {Object}

	DEPENDENCIES:
		- jquery 3.x

*/

import Constants from 'config/Constants';
import modalTemplate from 'templates/ModalTemplate.hbs';

class ModalWindow {

	constructor(options = {}) {
		this.$window = $(window);
		this.$document = $(document);
		this.$html = $('html');
		this.$body = $('body');
		this.initialize(options);
	}

	initialize(options) {

		// defaults
		this.options = Object.assign({
			selectorTriggers: 'a.modal-trigger[data-targetID]',
			templateModal: modalTemplate(), //.hbs files return a function which returns html
			selectorOverlay: '.modal-overlay', //must match element in template
			selectorModal: '.modal', //must match element in template
			selectorContent: '.modal--content', //must match element in template
			selectorCloseBtn: '.btn-closeX', //must match close button in template
			selectorCloseLinks: '.close-modal', //close links within modal content
			activeClass: 'is-active',
			activeBodyClass: 'modal-active',
			enableOverlayCloseClick: false,
			animDuration: Constants.timing.standard,
			selectorContentEls: Constants.contentElements,
			customEventPrefix: 'ModalWindow'
		}, options);

		// elements
		this.$activeTrigger = null;
		this.$modalWindow = null;
		this.$overlay = null;
		this.$modal = null;
		this.$content = null;
		this.$closeBtn = null;

		// properties
		this.isModalActivated = false;
		this.windowScrollTop = 0;

		this.initDOM();

		this._addEventListeners();

	}


/**
*	Private Methods
**/

	initDOM() {

		this.$modalWindow = $(this.options.templateModal);

		this.$overlay = this.$modalWindow.find(this.options.selectorOverlay);

		this.$modal = this.$modalWindow.find(this.options.selectorModal);
		this.$modal.attr({'aria-live':'polite'});

		this.$content = this.$modal.find(this.options.selectorContent);

		this.$closeBtn = this.$modal.find(this.options.selectorCloseBtn);

	}

	_addEventListeners() {
		const { keys } = Constants;

		this.$body.on('click', this.options.selectorTriggers, (event) => {
			event.preventDefault();
			if (!this.isModalActivated) {
				this.$activeTrigger = $(event.currentTarget);
				this.openModal();
			}
		});

		this.$closeBtn.on('click', (event) => {
			event.preventDefault();
			if (this.isModalActivated) {
				this.closeModal();
			}
		});

		this.$content.on('click', this.options.selectorCloseLinks, (event) => {
			event.preventDefault();
			if (this.isModalActivated) {
				this.closeModal();
			}
		});

		this.$overlay.on('click', (event) => {
			if (this.isModalActivated && this.options.enableOverlayCloseClick) {
				this.closeModal();
			}
		});

		this.$document.on('focusin', (event) => {
			if (this.isModalActivated && !this.$modal[0].contains(event.target)) {
				this.setContentFocus();
			}
		});

		this.$document.on('keydown', (event) => {
			if (this.isModalActivated && event.which === keys.escape) {
				this.closeModal();
			}
		});

		this.$document.on('scroll', (event) => {
			if (this.isModalActivated) {
				this.$window.scrollTop(this.windowScrollTop);
			}
		});

		this.$window.on('orientationchange', (event) => {
			if (this.isModalActivated) {
				this.$window.scrollTop(this.windowScrollTop);
			}
		});

	}


/**
*	Public Methods
**/

	openModal() {
		this.isModalActivated = true;
		this.windowScrollTop = this.$window.scrollTop();

		this.getContent();

		this.$html.addClass(this.options.activeBodyClass);
		this.$body.addClass(this.options.activeBodyClass);
		this.$modalWindow.appendTo(this.$body);
		this.$overlay.addClass(this.options.activeClass);
		this.$modal.addClass(this.options.activeClass);

		$.event.trigger(`${this.options.customEventPrefix}:modalPreOpen`, [this.$modal]);

		setTimeout(() => {
			this.modalOpened();
		}, this.options.animDuration);
	}

	// can extend or override getContent, insertContent, and modalOpened
	// methods in subclass to create custom modal

	getContent() {
		let targetID = this.$activeTrigger.data('targetid');
		let targetEl = $(`#${targetID}`);
		let contentHTML = targetEl.html();
		this.insertContent(contentHTML);
	}

	insertContent(contentHTML) {
		this.$content.html(contentHTML);
	}

	modalOpened() {
		this.setContentFocus();
		$.event.trigger(`${this.options.customEventPrefix}:modalOpened`, [this.$modal]);
	}

	closeModal() {
		this.$html.removeClass(this.options.activeBodyClass);
		this.$body.removeClass(this.options.activeBodyClass);
		this.$overlay.removeClass(this.options.activeClass);
		this.$modal.removeClass(this.options.activeClass);
		this.$window.scrollTop(this.windowScrollTop);

		$.event.trigger(`${this.options.customEventPrefix}:modalPreClose`, [this.$modal]);

		setTimeout(() => {
			this.modalClosed();
		}, this.options.animDuration);
	}

	// can extend modalClosed method in subclass
	// to create custom modal

	modalClosed() {
		this.$content.empty();
		this.$modalWindow.detach();
		if (this.$activeTrigger.length) {
			this.$activeTrigger.focus();
		} else {
			this.$body.find(this.options.selectorContentEls).first().attr({'tabindex':'-1'}).focus();
		}
		this.isModalActivated = false;
		this.windowScrollTop = 0;
		$.event.trigger(`${this.options.customEventPrefix}:modalClosed`, [this.$modal]);
	}

	setContentFocus() {
		let $focusEl = this.$content.find(this.options.selectorContentEls).first();
		$focusEl.attr({'tabindex':'-1'}).focus();
	}

}

export default ModalWindow;
