/*
	TITLE: DateRangeSlider

	DESCRIPTION: A range slider widget for selecting a date or time, useful for small ranges, use DualDatepicker for large ranges.

	VERSION: 0.1.1

	USAGE: let myDateRangeSlider = new DateRangeSlider('Element', 'Options')
		@param {jQuery Object}
		@param {Object}

	AUTHOR: Chris Nelson <cnelson87@gmail.com>

	DEPENDENCIES:
		- jquery 3.x
		- moment 2.18.1
		- noUiSlider 10.1.0

*/

import AppConfig from 'config/AppConfig';

class DateRangeSlider {

	constructor($el, options = {}) {
		this.initialize($el, options);
	}

	initialize($el, options) {
		const steps = {
			day: 86400000, //(24 * 60 * 60 * 1000)
			hour: 3600000, //(60 * 60 * 1000)
			hHour: 1800000, //(30 * 60 * 1000)
			qHour: 900000, //(15 * 60 * 1000)
			minute: 60000 //(60 * 1000)
		};

		// defaults
		this.$el = $el;
		this.options = Object.assign({
			selectorSlider: '.noUiSlider',
			selectorOutputs: '.range-slider--output',
			selectorFields: '.range-slider--field',
			classInitialized: 'is-initialized',
			sliderSteps: steps.day,
			dateFormat: 'ddd MMM Do YYYY, h:mm:ss a',
			customEventPrefix: 'DateRangeSlider'
		}, options);

		// element references
		this.$slider = this.$el.find(this.options.selectorSlider).first(); //must be only 1
		this.$outputs = this.$el.find(this.options.selectorOutputs); //must be exactly 2 (start & end)
		this.$fields = this.$el.find(this.options.selectorFields); //must be exactly 2 (start & end)

		// setup & properties
		this.data = this.$slider.data();
		this.steps = this.data.steps || this.options.sliderSteps;
		this.min = new Date(this.data.min); //data-min is required
		this.max = new Date(this.data.max); //data-max is required
		this.start = this.data.start ? new Date(this.data.start) : this.min; //data-start is optional
		this.end = this.data.end ? new Date(this.data.end) : this.max; //data-end is optional
		this.dateFormat = this.options.dateFormat;

		this.initSlider();

		this.$el.addClass(this.options.classInitialized);

		$.event.trigger(`${this.options.customEventPrefix}:isInitialized`, [this.$el]);

	}

	initSlider() {
		const slider = this.$slider[0]; // native slider element
		const { keys } = AppConfig;

		let formateDate = (date) => {
			return moment(date).format(this.dateFormat);
		};

		noUiSlider.create(slider, {
			connect: [false, true, false],
			range: {
				min: this.min.getTime(),
				max: this.max.getTime()
			},
			step: this.steps,
			start: [this.start.getTime(), this.end.getTime()]
		});
		slider.noUiSlider.on('update', function(values, index) {
			this.$outputs.eq(index).html(formateDate(new Date(+values[index])));
		}.bind(this));
		slider.noUiSlider.on('change', function(values, index) {
			this.$fields.eq(index).val(new Date(+values[index])).change();
		}.bind(this));
		this.$fields.eq(0).val(this.start);
		this.$fields.eq(1).val(this.end);
		// this.$fields.on('change', function(event){
		// 	console.log('date change:', $(event.currentTarget).val());
		// });

		slider.querySelector('.noUi-handle.noUi-handle-lower').addEventListener('keydown', (event) => {
			let value = Number(slider.noUiSlider.get()[0]);
			switch (event.which) {
				case keys.left: value -= this.steps;
					break;
				case keys.right: value += this.steps;
					break;
			}
			slider.noUiSlider.set([value, null]);
			this.$fields.eq(0).val(new Date(value)).change();
		});

		slider.querySelector('.noUi-handle.noUi-handle-upper').addEventListener('keydown', (event) => {
			let value = Number(slider.noUiSlider.get()[1]);
			switch (event.which) {
				case keys.left: value -= this.steps;
					break;
				case keys.right: value += this.steps;
					break;
			}
			slider.noUiSlider.set([null, value]);
			this.$fields.eq(1).val(new Date(value)).change();
		});

	}

}

export default DateRangeSlider;
