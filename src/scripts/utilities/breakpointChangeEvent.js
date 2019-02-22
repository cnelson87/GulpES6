/**
 * @module breakpointChangeEvent
 * @author Chris Nelson <cnelson87@gmail.com>
 * @description Broadcasts pseudo 'breakpointChange' event
 */

import Events from 'config/Events';
import State from 'config/State';

const breakpointChangeEvent = function() {

	let $elIndicator = $('<div></div>',{
		'id': 'breakpoint-indicator'
	}).appendTo($('body'));
	let zIndex = $elIndicator.css('z-index');

	let updateState = function() {
		State.currentBreakpoint = State.breakpoints[zIndex];
		State.isMobileView = State.currentBreakpoint === 'mobile';
		State.isTabletView = State.currentBreakpoint === 'tablet';
		State.isDesktopView = State.currentBreakpoint === 'desktop';
	};
	updateState();

	window.addEventListener('resize', function(event) {
		let newZI = $elIndicator.css('z-index');
		if (newZI !== zIndex) {
			zIndex = newZI;
			let customChangeEvent = new CustomEvent(Events.BREAKPOINT_CHANGE, {
				breakpoint: State.breakpoints[zIndex]
			});
			updateState();
			window.dispatchEvent(customChangeEvent);
		}
	});

};

export default breakpointChangeEvent;
