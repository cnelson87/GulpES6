/*
	TITLE: RangeSlider

	DESCRIPTION: A range slider widget

	VERSION: 0.1.2

	USAGE: let myRangeSlider = new RangeSlider('Element', 'Options')
		@param {jQuery Object}
		@param {Object}

	DEPENDENCIES:
		- jquery 3.x
		- noUiSlider 10.1.0

*/

import Constants from 'config/Constants';

class RangeSlider {

	constructor($el, options = {}) {
		this.initialize($el, options);
	}

	initialize($el, options) {

		// defaults
		this.$el = $el;
		this.options = Object.assign({
			selectorSlider: '.noUiSlider',
			selectorOutputs: '.range-slider--output',
			selectorFields: '.range-slider--field',
			classInitialized: 'is-initialized',
			sliderSteps: 1,
			customEventPrefix: 'RangeSlider'
		}, options);

		// elements
		this.$slider = this.$el.find(this.options.selectorSlider).first(); //must be only 1
		this.$outputs = this.$el.find(this.options.selectorOutputs); //must be exactly 2 (start & end)
		this.$fields = this.$el.find(this.options.selectorFields); //must be exactly 2 (start & end)

		// properties
		this.data = this.$slider.data();
		this.steps = this.data.steps || this.options.sliderSteps;
		this.min = this.data.min; //data-min is required
		this.max = this.data.max; //data-max is required
		this.start = this.data.start || this.min; //data-start is optional
		this.end = this.data.end || this.max; //data-end is optional

		this.initSlider();

		this.$el.addClass(this.options.classInitialized);

		$.event.trigger(`${this.options.customEventPrefix}:isInitialized`, [this.$el]);

	}

	initSlider() {
		const slider = this.$slider[0]; // native slider element
		const { keys } = Constants;

		noUiSlider.create(slider, {
			connect: [false, true, false],
			range: {
				min: this.min,
				max: this.max
			},
			step: this.steps,
			start: [this.start, this.end]
		});
		slider.noUiSlider.on('update', function(values, index) {
			this.$outputs.eq(index).html(+values[index]);
		}.bind(this));
		slider.noUiSlider.on('change', function(values, index) {
			this.$fields.eq(index).val(+values[index]).change();
		}.bind(this));
		this.$fields.eq(0).val(this.start);
		this.$fields.eq(1).val(this.end);
		// this.$fields.on('change', function(event){
		// 	console.log('on change:', $(event.currentTarget).val());
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
			this.$fields.eq(0).val(value).change();
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
			this.$fields.eq(1).val(value).change();
		});

	}

}

export default RangeSlider;
