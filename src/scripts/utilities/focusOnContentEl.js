/**
 * @module focusOnContentEl
 * @description Sets focus on content and optionally scrolls into view
 * @param: jQuery $element required, extraOffset & scrollSpeed optional
 */

import Constants from 'config/Constants';
import State from 'config/State';

const focusOnContentEl = function($el, extraTopOffset = 0, scrollSpeed = Constants.timing.fast) {
	const $window = $(window);
	const $htmlBody = $('html, body');
	const easing = 'easeOutCubic';
	const topOffset = State.topOffset + extraTopOffset;
	const pnlTop = $el.offset().top;
	const pnlHeight = $el.outerHeight();
	const winTop = $window.scrollTop() + topOffset;
	const winHeight = $window.height() - topOffset;
	const scrollTop = pnlTop - topOffset;
	let tabindex = '-1';
	let $focusEl = $el.find(Constants.contentElements).filter(':visible').first();
	if (!$focusEl.length) {
		$focusEl = $el;
	}
	if ($focusEl.attr('tabindex') === '0' ||
		$focusEl.prop('tagName') === 'A' ||
		$focusEl.prop('tagName') === 'BUTTON') {
		tabindex = '0';
	}

	if (pnlTop < winTop || pnlTop + pnlHeight > winTop + winHeight) {
		$htmlBody.animate({scrollTop: scrollTop}, scrollSpeed, easing, () => {
			$focusEl.attr({'tabindex': tabindex}).focus();
		});
	} else {
		$focusEl.attr({'tabindex': tabindex}).focus();
	}

};

export default focusOnContentEl;
