/**
 * @module resizeBeginEndEvents
 * @author Chris Nelson <cnelson87@gmail.com>
 * @description Broadcasts pseudo 'resizeStart' and 'resizeStop' events
 */

import Events from 'config/Events';

const resizeBeginEndEvents = function() {
	let timer;
	let timeoutTime = 100;
	window.addEventListener('resize', function(event) {
		let customResizeStartEvent = new Event(Events.WINDOW_RESIZE_BEGIN);
		let customResizeStopEvent = new Event(Events.WINDOW_RESIZE_END);
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

export default resizeBeginEndEvents;
