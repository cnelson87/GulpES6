/**
 * @module scrollBeginEndEvents
 * @description Broadcasts pseudo 'scrollBegin' and 'scrollEnd' events
 */

import Events from 'config/Events';

const scrollBeginEndEvents = function() {
	const customScrollBeginEvent = new Event(Events.WINDOW_SCROLL_BEGIN);
	const customScrollEndEvent = new Event(Events.WINDOW_SCROLL_END);
	const timerDelay = 100;
	let timer = null;

	window.addEventListener('scroll', (event) => {
		if (timer) {
			clearTimeout(timer);
		} else {
			window.dispatchEvent(customScrollBeginEvent);
		}
		timer = setTimeout(() => {
			timer = null;
			window.dispatchEvent(customScrollEndEvent);
		}, timerDelay);
	});
};

export default scrollBeginEndEvents;
