/*
	TITLE: SelectTabSwitcher

	DESCRIPTION: Subclass of TabSwitcher uses a select dropdown instead of tabs

	VERSION: 0.1.0

	USAGE: let mySelectTabSwitcher = new SelectTabSwitcher('Element', 'Options')
		@param {jQuery Object}
		@param {Object}

	AUTHOR: Chris Nelson <cnelson87@gmail.com>

	DEPENDENCIES:
		- jquery 3.x

*/

import TabSwitcher from '../widgets/TabSwitcher';

class SelectTabSwitcher extends TabSwitcher {

	initialize($el, options) {

		// defaults
		this.$el = $el;
		this.options = Object.assign({
			initialIndex: 0,
			selectorSelect: '.tabswitcher--tabnav select',
			selectorTabs: null,
			customEventPrefix: 'SelectTabSwitcher'
		}, options);

		// element references
		this.$select = this.$el.find(this.options.selectorSelect);

		super.initialize($el, this.options);
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

		if (this.isAnimating) {return;}

		if (this.currentIndex === index) {
			this.focusOnPanel($currentPanel);
		} else {
			this.previousIndex = this.currentIndex;
			this.currentIndex = index;
			this.switchPanels(event);
		}
	}

}

export default SelectTabSwitcher;
