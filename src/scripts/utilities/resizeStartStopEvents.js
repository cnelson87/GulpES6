/**
 * @module resizeStartStopEvents
 * @author Chris Nelson <cnelson87@gmail.com>
 * @description Broadcasts pseudo 'resizeStart' and 'resizeStop' events
 */

import AppEvents from 'config/AppEvents';

const resizeStartStopEvents = function() {
	let timer;
	let timeoutTime = 100;
	window.addEventListener('resize', function(event) {
		let customResizeStartEvent = new Event(AppEvents.WINDOW_RESIZE_START);
		let customResizeStopEvent = new Event(AppEvents.WINDOW_RESIZE_STOP);
		if (timer) {
			clearTimeout(timer);
		} else {
			window.dispatchEvent(customResizeStartEvent);
		}
		timer = setTimeout(function() {
			timer = null;
			window.dispatchEvent(customResizeStopEvent);
		}, timeoutTime);
	});
};

export default resizeStartStopEvents;
