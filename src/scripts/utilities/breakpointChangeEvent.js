/**
 * @module breakpointChangeEvent
 * @author Chris Nelson <cnelson87@gmail.com>
 * @description Broadcasts pseudo 'breakpointChange' event
 */

import AppEvents from 'config/AppEvents';
import AppState from 'config/AppState';

const breakpointChangeEvent = function() {

	let $elIndicator = $('<div></div>',{
		'id': 'breakpoint-indicator'
	}).appendTo($('body'));
	let zIndex = $elIndicator.css('z-index');

	let updateAppState = function() {
		AppState.currentBreakpoint = AppState.breakpoints[zIndex];
		AppState.isMobileView = AppState.currentBreakpoint === 'mobile';
		AppState.isTabletView = AppState.currentBreakpoint === 'tablet';
		AppState.isDesktopView = AppState.currentBreakpoint === 'desktop';
	};
	updateAppState();

	window.addEventListener('resize', function(event) {
		let newZI = $elIndicator.css('z-index');
		if (newZI !== zIndex) {
			zIndex = newZI;
			let customChangeEvent = new CustomEvent(AppEvents.BREAKPOINT_CHANGE, {
				breakpoint: AppState.breakpoints[zIndex]
			});
			updateAppState();
			window.dispatchEvent(customChangeEvent);
		}
	});

};

export default breakpointChangeEvent;
