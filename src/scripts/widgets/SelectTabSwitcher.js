/*
	TITLE: SelectTabSwitcher

	DESCRIPTION: Subclass of TabSwitcher uses a select dropdown instead of tabs

	USAGE: const mySelectTabSwitcher = new SelectTabSwitcher('Element', 'Options')
		@param {HTMLElement}
		@param {Object}

*/

import parseDatasetToObject from 'utilities/parseDatasetToObject';
import TabSwitcher from 'widgets/TabSwitcher';

class SelectTabSwitcher extends TabSwitcher {

	initialize(rootEl, options) {
		const dataOptions = rootEl.dataset.options ? parseDatasetToObject(rootEl.dataset.options) : {};

		const subclassOptions = Object.assign({
			initialIndex: 0,
			selectorSelect: '.tabswitcher--tabnav select',
			autoRotate: false, //DO NOT SET TRUE
			customEventPrefix: 'SelectTabSwitcher'
		}, options, dataOptions);

		// elements
		this.selectEl = rootEl.querySelector(subclassOptions.selectorSelect);

		super.initialize(rootEl, subclassOptions);
	}


	/**
	*	Private Methods
	**/

	_addEventListeners() {
		this.selectEl.addEventListener('change', this.__changeSelect.bind(this));
	}

	_removeEventListeners() {
		this.selectEl.removeEventListener('change', this.__changeSelect.bind(this));
	}


	/**
	*	Event Handlers
	**/

	__changeSelect(event) {
		const index = this.selectEl.selectedIndex;
		const currentPanelEl = this.panelEls[index];

		if (this.state.isAnimating) {return;}

		if (this.state.currentIndex === index) {
			this.focusOnPanel(currentPanelEl);
		}
		else {
			this.state.previousIndex = this.state.currentIndex;
			this.state.currentIndex = index;
			this.switchPanels(event);
		}
	}


	/**
	 *	Public Methods
	 **/

	deactivateTab() {}

	activateTab() {}

}

export default SelectTabSwitcher;
