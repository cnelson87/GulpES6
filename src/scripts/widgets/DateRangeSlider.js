/*
	TITLE: DateRangeSlider

	DESCRIPTION: A range slider widget for selecting a date or time, useful for small ranges, use DualDatepicker for large ranges.

	USAGE: const myDateRangeSlider = new DateRangeSlider('Element', 'Options')
		@param {HTMLElement}
		@param {Object}

	DEPENDENCIES:
		noUiSlider 14.x
		moment 2.x

*/

import Constants from 'config/Constants';

class DateRangeSlider {

	constructor(rootEl, options = {}) {
		if (!rootEl) {
			console.warn('DateRangeSlider cannot initialize without rootEl');
			return;
		}
		this.initialize(rootEl, options);
	}

	initialize(rootEl, options) {
		const steps = {
			day: 86400000, //(24 * 60 * 60 * 1000)
			hour: 3600000, //(60 * 60 * 1000)
			hHour: 1800000, //(30 * 60 * 1000)
			qHour: 900000, //(15 * 60 * 1000)
			minute: 60000 //(60 * 1000)
		};

		// defaults
		this.rootEl = rootEl;
		this.options = Object.assign({
			selectorSlider: '.noUiSlider',
			selectorOutputs: '.range-slider--output',
			selectorFields: '.range-slider--field',
			classInitialized: 'is-initialized',
			sliderSteps: steps.day,
			dateFormat: 'ddd MMM Do YYYY, h:mm:ss a',
			customEventPrefix: 'DateRangeSlider'
		}, options);

		// elements
		this.sliderEl = this.rootEl.querySelector(this.options.selectorSlider); //must be only 1
		this.outputEls = this.rootEl.querySelectorAll(this.options.selectorOutputs); //must be exactly 2 (start & end)
		this.fieldEls = this.rootEl.querySelectorAll(this.options.selectorFields); //must be exactly 2 (start & end)

		// properties
		this.data = this.sliderEl.dataset;
		this.steps = this.data.steps || this.options.sliderSteps;
		this.min = new Date(this.data.min); //data-min is required
		this.max = new Date(this.data.max); //data-max is required
		this.start = this.data.start ? new Date(this.data.start) : this.min; //data-start is optional
		this.end = this.data.end ? new Date(this.data.end) : this.max; //data-end is optional
		this.dateFormat = this.options.dateFormat;

		this.initSlider();

		this.rootEl.classList.add(this.options.classInitialized);

		window.dispatchEvent(new CustomEvent(`${this.options.customEventPrefix}:isInitialized`, {detail: {rootEl: this.rootEl}} ));
	}

	initSlider() {
		const sliderEl = this.sliderEl;
		const { keys } = Constants;

		const formateDate = (date) => {
			return moment(date).format(this.dateFormat);
		};

		this.fieldEls[0].value = this.start;
		this.fieldEls[1].value = this.end;

		noUiSlider.create(sliderEl, {
			start: [this.start.getTime(), this.end.getTime()],
			connect: [false, true, false],
			range: {
				min: this.min.getTime(),
				max: this.max.getTime()
			},
			step: this.steps,
			// snap: true,
		});

		sliderEl.noUiSlider.on('update', (values, index) => {
			this.outputEls[index].innerHTML = formateDate(new Date(+values[index]));
		});

		sliderEl.noUiSlider.on('change', (values, index) => {
			this.fieldEls[index].value = new Date(+values[index]);
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
			this.fieldEls[0].value = new Date(value);
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
			this.fieldEls[1].value = new Date(value);
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

export default DateRangeSlider;
