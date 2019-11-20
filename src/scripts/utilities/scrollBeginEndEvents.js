/**
 * @module scrollBeginEndEvents
 * @description Broadcasts pseudo 'scrollBegin' and 'scrollEnd' events
 */

import Events from 'config/Events';

const scrollBeginEndEvents = function() {
	const timerDelay = 100;
	let timer = null;

	window.addEventListener('scroll', (event) => {
		let customScrollBeginEvent = new Event(Events.WINDOW_SCROLL_BEGIN);
		let customScrollEndEvent = new Event(Events.WINDOW_SCROLL_END);
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
