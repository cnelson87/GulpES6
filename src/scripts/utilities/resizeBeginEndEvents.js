/**
 * @module resizeBeginEndEvents
 * @description Broadcasts pseudo 'resizeBegin' and 'resizeEnd' events
 */

import Events from 'config/Events';

const resizeBeginEndEvents = function() {
	const timerDelay = 100;
	let timer = null;

	window.addEventListener('resize', (event) => {
		let customResizeBeginEvent = new Event(Events.WINDOW_RESIZE_BEGIN);
		let customResizeEndEvent = new Event(Events.WINDOW_RESIZE_END);
		if (timer) {
			clearTimeout(timer);
		} else {
			window.dispatchEvent(customResizeBeginEvent);
		}
		timer = setTimeout(() => {
			timer = null;
			window.dispatchEvent(customResizeEndEvent);
		}, timerDelay);
	});
};

export default resizeBeginEndEvents;
