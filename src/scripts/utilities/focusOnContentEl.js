/**
 * @module focusOnContentEl
 * @author Chris Nelson <cnelson87@gmail.com>
 * @description Sets focus on content and optionally scrolls into view
 * @param: jQuery $element required, extraOffset & scrollSpeed optional
 */

import AppConfig from 'config/AppConfig';
import AppState from 'config/AppState';

const focusOnContentEl = function($el, extraTopOffset = 0, scrollSpeed = AppConfig.timing.fast) {
	const $window = $(window);
	const $htmlBody = $('html, body');
	let topOffset = AppState.topOffset + extraTopOffset;
	let pnlTop = $el.offset().top;
	let pnlHeight = $el.outerHeight();
	let winTop = $window.scrollTop() + topOffset;
	let winHeight = $window.height() - topOffset;
	let scrollTop = pnlTop - topOffset;
	let tabindex = '-1';
	let easing = 'easeOutCubic';
	let $focusEl = $el.find(AppConfig.contentElements).filter(':visible').first();
	if (!$focusEl.length) {$focusEl = $el;}
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
