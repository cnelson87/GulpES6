/*
	TITLE: AjaxModal

	DESCRIPTION: Subclass of ModalWindow GETs Ajax content

	VERSION: 0.4.0

	USAGE: const myAjaxModal = new AjaxModal('Options')
		@param {jQuery Object}
		@param {Object}

	DEPENDENCIES:
		- jquery 3.x
		- ModalWindow.js
		- LoaderSpinner.js
		- ajaxGet.js

*/

import ModalWindow from 'widgets/ModalWindow';
import LoaderSpinner from 'widgets/LoaderSpinner';
import ajaxGet from 'utilities/ajaxGet';

class AjaxModal extends ModalWindow {

	initialize(options) {

		let subclassOptions = Object.assign({
			selectorTriggers: 'a.modal-trigger[data-ajaxUrl]',
			ajaxErrorMsg: '<div class="errormessage"><p>Sorry. Ajax request failed.</p></div>',
			customEventPrefix: 'AjaxModal'
		}, options);

		// properties
		this.ajaxLoader = null;

		super.initialize(subclassOptions);

	}

	initDOM() {
		super.initDOM();
		this.ajaxLoader = new LoaderSpinner(this.$modal);
	}

	getContent() {
		const ajaxUrl = this.$activeTrigger.data('ajaxurl');
		const targetID = ajaxUrl.split('#')[1] || null;

		this.ajaxLoader.addLoader();

		ajaxGet(ajaxUrl, 'html')
			.then((response) => {
				// console.log(response);
				let contentHTML;
				let targetEl;
				if (targetID) {
					targetEl = $(response).find('#' + targetID);
					if (targetEl.length) {
						contentHTML = $(response).find('#' + targetID).html();
					} else {
						contentHTML = $(response).html();
					}
				} else {
					contentHTML = response;
				}

				this.ajaxLoader.removeLoader();
				this.insertContent(contentHTML);
				this.setContentFocus();

			})
			.catch((error) => {
				// console.log(error);
				this.ajaxLoader.removeLoader();
				this.$content.html(this.options.ajaxErrorMsg);
			});

	}

}

export default AjaxModal;
