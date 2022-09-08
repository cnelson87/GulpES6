/*
	TITLE: DualDatepicker

	DESCRIPTION: jQuery-UI DualDatepicker widget

	USAGE: const myDualDatepicker = new DualDatepicker('Element', 'Options')
		@param {HTMLElement}
		@param {Object}

	DEPENDENCIES:
		jquery 3.x
		jQuery-ui 1.12.1

*/

class DualDatepicker {

	constructor(rootEl, options = {}) {
		if (!rootEl) {
			console.warn('DualDatepicker cannot initialize without rootEl');
			return;
		}
		this.initialize(rootEl, options);
	}

	initialize(rootEl, options) {

		// defaults
		this.rootEl = rootEl;
		this.options = Object.assign({
			selectorStartDatepicker: '.start-date',
			selectorEndDatepicker: '.end-date',
			bindEndDateToStartDate: true, //end date can't be before start date
			bindStartDateToEndDate: false, //start date can't be after end date
			minimumDateDiff: 1, //min num of days between start and end dates
			numberOfMonths: 2, //num months to show
			customEventPrefix: 'DualDatepicker'
		}, options);

		// elements
		this.$startDatepicker = $(this.rootEl.querySelector(this.options.selectorStartDatepicker));
		this.$endDatepicker = $(this.rootEl.querySelector(this.options.selectorEndDatepicker));

		this.$startDatepicker.prop('readonly', true);
		this.$startDatepicker.attr('readonly', 'readonly');
		this.$endDatepicker.prop('readonly', true);
		this.$endDatepicker.attr('readonly', 'readonly');

		this.initDatepickers();

		window.dispatchEvent(new CustomEvent(`${this.options.customEventPrefix}:isInitialized`, {detail: {rootEl: this.rootEl}} ));
	}

	initDatepickers() {
		// const $el = $(this.this.rootEl);
		const $startDatepicker = this.$startDatepicker;
		const $endDatepicker = this.$endDatepicker;
		const bindEndDate = this.options.bindEndDateToStartDate;
		const bindStartDate = this.options.bindStartDateToEndDate;
		const minimumDays = this.options.minimumDateDiff;
		const numberOfMonths = this.options.numberOfMonths;

		// function beforeShow(textbox, instance) {
		// 	console.log(textbox, instance);
		// 	let $datepicker = $('#ui-datepicker-div');
		// 	$datepicker.css({
		// 		position: 'absolute',
		// 		top: '-20px',
		// 		left: '5px'
		// 	});
		// 	$el.append($datepicker);
		// 	$datepicker.hide();
		// };

		function beforeShowDay(date) {
			const start = $startDatepicker.datepicker('getDate');
			const end = $endDatepicker.datepicker('getDate');
			const dpStart = Date.parse(start);
			const dpEnd = Date.parse(end);
			const dpDate = Date.parse(date);
			const data = ( dpDate >= dpStart && dpDate <= dpEnd ) ? [true, 'ui-state-active', ''] : [true, '', ''];
			return data;
		}

		$startDatepicker.datepicker({
			minDate: 0,
			maxDate: '+1y',
			defaultDate: '0',
			numberOfMonths: numberOfMonths,
			// showCurrentAtPos: 0,
			// beforeShow: beforeShow,
			beforeShowDay: beforeShowDay,
			onSelect: function(date) {
				if (bindEndDate) {
					$endDatepicker.datepicker('option', 'minDate', date);
				}
			}
		});

		$endDatepicker.datepicker({
			minDate: 0,
			maxDate: '+1y',
			defaultDate: '+1d',
			numberOfMonths: numberOfMonths,
			// showCurrentAtPos: 0,
			// beforeShow: beforeShow,
			beforeShowDay: beforeShowDay,
			onSelect: function(date) {
				if (bindStartDate) {
					$startDatepicker.datepicker('option', 'maxDate', date);
				}
			}
		});

		// Set default date
		$startDatepicker.datepicker('setDate', '0');
		$endDatepicker.datepicker('setDate', '+'+minimumDays+'d');

		// blurring on focus to:
		// 1. Prevent visible blinking cursor through calendar on iOS.
		// 2. Remove "done" form control on iOS.
		// Note: may affect accessibility, may need to revisit
		$startDatepicker.on('focus', () => {
			$startDatepicker.blur();
		});
		$endDatepicker.on('focus', () => {
			$endDatepicker.blur();
		});

	}

}

export default DualDatepicker;
