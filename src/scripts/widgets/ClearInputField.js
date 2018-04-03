/*
	TITLE: ClearInputField

	DESCRIPTION: Mimics the -webkit- input type='search' clear 'X' icon

	VERSION: 0.0.1

	AUTHOR: Chris Nelson <cnelson87@gmail.com>

*/

class ClearInputField {
	constructor($el) {
		this.init($el);
	}

	init($el) {
		this.$el = $el;
		this.$input = this.$el.find('[data-input-field]');
		this.$clear = this.$el.find('[data-clear-button]');

		this.$clear.on('click', this.clear.bind(this));
	}

	clear() {
		this.$input.val('').focus();
	}
}

export default ClearInputField;
