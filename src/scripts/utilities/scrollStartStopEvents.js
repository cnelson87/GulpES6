/**
 * scrollStartStopEvents
 * @author: Chris Nelson <cnelson87@gmail.com>
 * @description: Broadcasts pseudo 'scrollStart' and 'scrollStop' events
 */

import AppEvents from '../config/AppEvents';

const scrollStartStopEvents = function() {
	let timer;
	let timeoutTime = 100;
	window.addEventListener('scroll', function(event) {
		if (timer) {
			clearTimeout(timer);
		} else {
			$.event.trigger(AppEvents.WINDOW_SCROLL_START);
		}
		timer = setTimeout(function() {
			timer = null;
			$.event.trigger(AppEvents.WINDOW_SCROLL_STOP);
		}, timeoutTime);
	});
};

export default scrollStartStopEvents;
