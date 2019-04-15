/**
 * @module scrollBeginEndEvents
 * @description Broadcasts pseudo 'scrollBegin' and 'scrollEnd' events
 */

import Events from 'config/Events';

const scrollBeginEndEvents = function() {
	const timerDelay = 100;
	let timer = null;

	window.addEventListener('scroll', (event) => {
		let customScrollStartEvent = new Event(Events.WINDOW_SCROLL_BEGIN);
		let customScrollStopEvent = new Event(Events.WINDOW_SCROLL_END);
		if (timer) {
			clearTimeout(timer);
		} else {
			window.dispatchEvent(customScrollStartEvent);
		}
		timer = setTimeout(() => {
			timer = null;
			window.dispatchEvent(customScrollStopEvent);
		}, timerDelay);
	});
};

export default scrollBeginEndEvents;
