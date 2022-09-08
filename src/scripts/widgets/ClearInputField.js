/*
	TITLE: ClearInputField

	DESCRIPTION: Mimics the -webkit- input type='search' clear 'X' icon

	USAGE: const myClearInputField = new ClearInputField('Element')
		@param {HTMLElement}

*/

class ClearInputField {

	constructor(rootEl) {
		if (!rootEl) {
			console.warn('ClearInputField cannot initialize without rootEl');
			return;
		}
		this.initialize(rootEl);
	}

	initialize(rootEl) {
		this.rootEl = rootEl;
		this.inputField = this.rootEl.querySelector('[data-input-field]');
		this.clearBtn = this.rootEl.querySelector('[data-clear-button]');
		this.clearBtn.addEventListener('click', this.clear.bind(this));
	}

	clear() {
		this.inputField.value = '';
		this.inputField.focus();
	}

}

export default ClearInputField;
