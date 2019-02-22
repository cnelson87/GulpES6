/**
 * @module scrollBeginEndEvents
 * @author Chris Nelson <cnelson87@gmail.com>
 * @description Broadcasts pseudo 'scrollStart' and 'scrollStop' events
 */

import Events from 'config/Events';

const scrollBeginEndEvents = function() {
	let timer;
	let timeoutTime = 100;
	window.addEventListener('scroll', function(event) {
		let customScrollStartEvent = new Event(Events.WINDOW_SCROLL_BEGIN);
		let customScrollStopEvent = new Event(Events.WINDOW_SCROLL_END);
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

export default scrollBeginEndEvents;
