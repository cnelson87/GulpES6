/**
 * breakpointChangeEvent
 * @author: Chris Nelson <cnelson87@gmail.com>
 * @description: Broadcasts pseudo 'breakpointChange' event
 */

import AppConfig from '../config/AppConfig';
import AppEvents from '../config/AppEvents';

const breakpointChangeEvent = function() {

	let $elIndicator = $('<div></div>',{
		'id': 'breakpoint-indicator'
	}).appendTo($('body'));
	let zIndex = $elIndicator.css('z-index');

	let updateAppConfig = function() {
		AppConfig.currentBreakpoint = AppConfig.breakpoints[zIndex];
		AppConfig.isMobileView = AppConfig.currentBreakpoint === 'mobile';
		AppConfig.isTabletView = AppConfig.currentBreakpoint === 'tablet';
		AppConfig.isDesktopView = AppConfig.currentBreakpoint === 'desktop';
	};
	updateAppConfig();

	window.addEventListener('resize', function(event) {
		let newZI = $elIndicator.css('z-index');
		if (newZI !== zIndex) {
			zIndex = newZI;
			let customChangeEvent = new CustomEvent(AppEvents.BREAKPOINT_CHANGE, {
				breakpoint: AppConfig.breakpoints[zIndex]
			});
			updateAppConfig();
			window.dispatchEvent(customChangeEvent);
		}
	});

};

export default breakpointChangeEvent;
