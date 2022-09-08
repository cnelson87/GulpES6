/*
	TITLE: RangeSlider

	DESCRIPTION: A range slider widget

	USAGE: const myRangeSlider = new RangeSlider('Element', 'Options')
		@param {HTMLElement}
		@param {Object}

	DEPENDENCIES:
		noUiSlider 14.x

*/

import Constants from 'config/Constants';

class RangeSlider {

	constructor(rootEl, options = {}) {
		if (!rootEl) {
			console.warn('RangeSlider cannot initialize without rootEl');
			return;
		}
		this.initialize(rootEl, options);
	}

	initialize(rootEl, options) {

		// defaults
		this.rootEl = rootEl;
		this.options = Object.assign({
			selectorSlider: '.noUiSlider',
			selectorOutputs: '.range-slider--output',
			selectorFields: '.range-slider--field',
			classInitialized: 'is-initialized',
			sliderSteps: 1,
			customEventPrefix: 'RangeSlider'
		}, options);

		// elements
		this.sliderEl = this.rootEl.querySelector(this.options.selectorSlider); //must be only 1
		this.outputEls = this.rootEl.querySelectorAll(this.options.selectorOutputs); //must be exactly 2 (start & end)
		this.fieldEls = this.rootEl.querySelectorAll(this.options.selectorFields); //must be exactly 2 (start & end)

		// properties
		this.data = this.sliderEl.dataset;
		this.steps = this.data.steps || this.options.sliderSteps;
		this.min = Number(this.data.min); //data-min is required
		this.max = Number(this.data.max); //data-max is required
		this.start = this.data.start ? Number(this.data.start) : this.min; //data-start is optional
		this.end = this.data.end ? Number(this.data.end) : this.max; //data-end is optional

		this.initSlider();

		this.rootEl.classList.add(this.options.classInitialized);

		window.dispatchEvent(new CustomEvent(`${this.options.customEventPrefix}:isInitialized`, {detail: {rootEl: this.rootEl}} ));
	}

	initSlider() {
		const sliderEl = this.sliderEl;
		const { keys } = Constants;

		this.fieldEls[0].value = this.start;
		this.fieldEls[1].value = this.end;

		noUiSlider.create(sliderEl, {
			start: [this.start, this.end],
			connect: [false, true, false],
			range: {
				min: this.min,
				max: this.max
			},
			step: this.steps,
			// snap: true,
		});

		sliderEl.noUiSlider.on('update', (values, index) => {
			this.outputEls[index].innerHTML = +values[index];
		});

		sliderEl.noUiSlider.on('change', (values, index) => {
			this.fieldEls[index].value = +values[index];
			this.fieldEls[index].dispatchEvent(new Event('change'));
		});

		sliderEl.querySelector('.noUi-handle.noUi-handle-lower').addEventListener('keydown', (event) => {
			let value = Number(sliderEl.noUiSlider.get()[0]);
			switch (event.which) {
				case keys.left: value -= this.steps;
					break;
				case keys.right: value += this.steps;
					break;
			}
			sliderEl.noUiSlider.set([value, null]);
			this.fieldEls[0].value = value;
			this.fieldEls[0].dispatchEvent(new Event('change'));
		});

		sliderEl.querySelector('.noUi-handle.noUi-handle-upper').addEventListener('keydown', (event) => {
			let value = Number(sliderEl.noUiSlider.get()[1]);
			switch (event.which) {
				case keys.left: value -= this.steps;
					break;
				case keys.right: value += this.steps;
					break;
			}
			sliderEl.noUiSlider.set([null, value]);
			this.fieldEls[1].value = value;
			this.fieldEls[1].dispatchEvent(new Event('change'));
		});

		// for testing:
		// this.fieldEls[0].addEventListener('change', (event) => {
		// 	console.log('on min change:', event.currentTarget.value);
		// });
		// this.fieldEls[1].addEventListener('change', (event) => {
		// 	console.log('on max change:', event.currentTarget.value);
		// });

	}

}

export default RangeSlider;
