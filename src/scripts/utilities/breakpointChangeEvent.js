/**
 * @module breakpointChangeEvent
 * @description Broadcasts pseudo 'breakpointChange' event
 */

import Events from 'config/Events';
import State from 'config/State';

const breakpointChangeEvent = function() {

	function updateState(zIndex) {
		State.currentBreakpoint = State.breakpoints[zIndex];
		State.isMobileView = State.currentBreakpoint === 'mobile';
		State.isTabletView = State.currentBreakpoint === 'tablet';
		State.isDesktopView = State.currentBreakpoint === 'desktop';
	};

	const $elIndicator = $('<div></div>',{
		'id': 'breakpoint-indicator'
	}).appendTo($('body'));

	let zIndex = $elIndicator.css('z-index');

	updateState(zIndex);

	window.addEventListener('resize', (event) => {
		let newZI = $elIndicator.css('z-index');
		if (newZI !== zIndex) {
			zIndex = newZI;
			let customChangeEvent = new CustomEvent(Events.BREAKPOINT_CHANGE, {
				breakpoint: State.breakpoints[zIndex]
			});
			updateState(zIndex);
			window.dispatchEvent(customChangeEvent);
		}
	});

};

export default breakpointChangeEvent;
