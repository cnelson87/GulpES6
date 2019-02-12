/*
	TITLE: AjaxModalForm

	DESCRIPTION: Subclass of AjaxModal also POSTs Ajax data

	VERSION: 0.1.2

	USAGE: let myAjaxModalForm = new AjaxModalForm('Options')
		@param {jQuery Object}
		@param {Object}

	AUTHOR: Chris Nelson <cnelson87@gmail.com>

	DEPENDENCIES:
		- jquery 3.x
		- AjaxModal.js
		- ajaxPost.js

*/

import AjaxModal from 'widgets/AjaxModal';
import ajaxPost from 'utilities/ajaxPost';
// import serializeFormFields from 'utilities/serializeFormFields';
import modalFullscreenTemplate from 'templates/ModalFullscreenTemplate.hbs';

class AjaxModalForm extends AjaxModal {

	initialize(options) {

		let subclassOptions = Object.assign({
			selectorTriggers: 'a.modal-form-trigger[data-ajaxUrl]',
			templateModal: modalFullscreenTemplate(),
			customEventPrefix: 'AjaxModalForm'
		}, options);

		// element references
		this.$form = null;

		super.initialize(subclassOptions);

	}

	modalOpened() {
		super.modalOpened();
		this.$form = this.$content.find('form');
		this.$form.on('submit', this.onFormPost.bind(this));
	}

	onFormPost(event) {
		event.preventDefault();
		let postUrl = this.$form.attr('action');
		// let data = serializeFormFields(this.$form);
		let data = this.$form.serialize()
		// console.log(data);

		this.ajaxLoader.addLoader();

		Promise.resolve(ajaxPost(postUrl, data)).then((response) => {
			// console.log('success', response);
			// this.ajaxLoader.removeLoader();
		}).catch((response) => {
			// console.log('error', response);
			// this.ajaxLoader.removeLoader();
		});

	}

	modalClosed() {
		this.$form.off('submit');
		this.$form = null;
		super.modalClosed();
	}

}

export default AjaxModalForm;
