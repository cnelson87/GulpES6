/*
	TITLE: SelectTabSwitcher

	DESCRIPTION: Subclass of TabSwitcher uses a select dropdown instead of tabs

	VERSION: 0.2.0

	USAGE: let mySelectTabSwitcher = new SelectTabSwitcher('Element', 'Options')
		@param {jQuery Object}
		@param {Object}

	DEPENDENCIES:
		- jquery 3.x

*/

import TabSwitcher from 'widgets/TabSwitcher';

class SelectTabSwitcher extends TabSwitcher {

	initialize($el, options) {

		let subclassOptions = Object.assign({
			initialIndex: 0,
			selectorSelect: '.tabswitcher--tabnav select',
			autoRotate: false,
			customEventPrefix: 'SelectTabSwitcher'
		}, options);

		// elements
		this.$select = $el.find(subclassOptions.selectorSelect);

		super.initialize($el, subclassOptions);
	}


/**
*	Private Methods
**/

	_addEventListeners() {
		this.$select.on('change', this.__changeSelect.bind(this));
	}

	_removeEventListeners() {
		this.$select.off('change', this.__changeSelect.bind(this));
	}


/**
*	Event Handlers
**/

	__changeSelect(event) {
		let index = this.$select.prop('selectedIndex');
		let $currentPanel = this.$panels.eq(index);

		if (this.state.isAnimating) {return;}

		if (this.state.currentIndex === index) {
			this.focusOnPanel($currentPanel);
		} else {
			this.state.previousIndex = this.state.currentIndex;
			this.state.currentIndex = index;
			this.switchPanels(event);
		}
	}

}

export default SelectTabSwitcher;
