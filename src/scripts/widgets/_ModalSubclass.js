/*
	TITLE: ModalSubclass

	DESCRIPTION: Subclass example of ModalWindow

	VERSION: 0.1.0

	USAGE: const myModalSubclass = new ModalSubclass('Options')
		@param {jQuery Object}
		@param {Object}

	DEPENDENCIES:
		- jquery 3.x
		- ModalWindow.js

*/

import ModalWindow from 'widgets/ModalWindow';

class ModalSubclass extends ModalWindow {

	initialize(options) {

		let subclassOptions = Object.assign({
			customEventPrefix: 'ModalSubclass'
		}, options);

		super.initialize(subclassOptions);

	}


/**
*	Private Methods
**/

	initDOM() {
		super.initDOM();
		// call super & customize initDOM method
	}


/**
*	Public Methods
**/

	getContent() {
		// override getContent method
	}

}

export default ModalSubclass;
