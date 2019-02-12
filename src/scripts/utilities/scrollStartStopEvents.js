/**
 * @module scrollStartStopEvents
 * @author Chris Nelson <cnelson87@gmail.com>
 * @description Broadcasts pseudo 'scrollStart' and 'scrollStop' events
 */

import AppEvents from 'config/AppEvents';

const scrollStartStopEvents = function() {
	let timer;
	let timeoutTime = 100;
	window.addEventListener('scroll', function(event) {
		let customScrollStartEvent = new Event(AppEvents.WINDOW_SCROLL_START);
		let customScrollStopEvent = new Event(AppEvents.WINDOW_SCROLL_STOP);
		if (timer) {
			clearTimeout(timer);
		} else {
			window.dispatchEvent(customScrollStartEvent);
		}
		timer = setTimeout(function() {
			timer = null;
			window.dispatchEvent(customScrollStopEvent);
		}, timeoutTime);
	});
};

export default scrollStartStopEvents;
