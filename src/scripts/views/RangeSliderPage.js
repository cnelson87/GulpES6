import RangeSlider from 'widgets/RangeSlider';
import DateRangeSlider from 'widgets/DateRangeSlider';

const RangeSliderPage = {

	initialize() {
		/* eslint-disable no-magic-numbers */
		new RangeSlider(document.getElementById('range-slider'), {
			sliderSteps: 1
		});
		new DateRangeSlider(document.getElementById('date-range-slider'), {
			sliderSteps: (60 * 60 * 1000) // 1 hr
		});
		new DateRangeSlider(document.getElementById('time-range-slider'), {
			sliderSteps: (15 * 60 * 1000) // 15 min
		});
		/* eslint-enable no-magic-numbers */
		// jQuery-UI slider
		const $sliderRange = $('#slider-range');
		const $amountOutput = $('#amount-output');
		$sliderRange.slider({
			range: true,
			min: 0,
			max: 500,
			values: [ 75, 300 ],
			slide: function(event, ui) {
				$amountOutput.val( '$' + ui.values[ 0 ] + ' - $' + ui.values[ 1 ] );
			}
		});
		$amountOutput.val( '$' + $sliderRange.slider('values', 0) + ' - $' + $sliderRange.slider('values', 1) );
	}

};

export default RangeSliderPage;
