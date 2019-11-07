/*
	TITLE: AjaxModalForm

	DESCRIPTION: Subclass of AjaxModal also POSTs Ajax data

	VERSION: 0.2.0

	USAGE: const myAjaxModalForm = new AjaxModalForm('Options')
		@param {jQuery Object}
		@param {Object}

	DEPENDENCIES:
		- jquery 3.x
		- jquery.validate
		- AjaxModal.js
		- ajaxPost.js
		- serializeFormFields.js

*/

import AjaxModal from 'widgets/AjaxModal';
import ajaxPost from 'utilities/ajaxPost';
import serializeFormFields from 'utilities/serializeFormFields';
import modalFullscreenTemplate from 'templates/ModalFullscreenTemplate.hbs';

class AjaxModalForm extends AjaxModal {

	initialize(options) {

		let subclassOptions = Object.assign({
			selectorTriggers: 'a.modal-form-trigger[data-ajaxUrl]',
			templateModal: modalFullscreenTemplate(),
			customEventPrefix: 'AjaxModalForm'
		}, options);

		// elements
		this.$form = null;

		super.initialize(subclassOptions);

	}

	modalOpened() {
		super.modalOpened();
		this.$form = this.$content.find('form');
		this.$form.validate(); // init jQuery validation
		this.$form.on('submit', this.onFormPost.bind(this));
	}

	onFormPost(event) {
		event.preventDefault();
		const postUrl = this.$form.attr('action');
		const formData = serializeFormFields(this.$form);

		if (this.$form.valid()) {
			this.ajaxLoader.addLoader();
			ajaxPost(postUrl, formData)
				.then((response) => {
					console.log('success:', response);
					this.ajaxLoader.removeLoader();
				}).catch((error) => {
					console.log('error:', error);
					this.ajaxLoader.removeLoader();
				});
		}

	}

	modalClosed() {
		this.$form.off('submit');
		this.$form = null;
		super.modalClosed();
	}

}

export default AjaxModalForm;
