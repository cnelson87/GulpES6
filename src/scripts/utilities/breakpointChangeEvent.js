/**
 * @module breakpointChangeEvent
 * @description Broadcasts pseudo 'breakpointChange' event
 */

import Constants from 'config/Constants';
import Events from 'config/Events';
import State from 'config/State';

const breakpointChangeEvent = function() {
	const { mediaQueries } = Constants;
	const mobileMediaQuery = window.matchMedia(`(max-width: ${mediaQueries.tablet-1}px)`);
	const tabletMediaQuery = window.matchMedia(`(min-width: ${mediaQueries.tablet}px) and (max-width: ${mediaQueries.desktop-1}px)`);
	const desktopMediaQuery = window.matchMedia(`(min-width: ${mediaQueries.desktop}px)`);

	function onMediaQueryChange(event, breakpoint) {
		if (event.matches) {
			State.currentBreakpoint = breakpoint;
			State.isMobileView = State.currentBreakpoint === 'mobile';
			State.isTabletView = State.currentBreakpoint === 'tablet';
			State.isDesktopView = State.currentBreakpoint === 'desktop';
			window.dispatchEvent(new CustomEvent(Events.BREAKPOINT_CHANGE, {detail: {breakpoint: State.currentBreakpoint}} ));
		}
	}

	mobileMediaQuery.addEventListener('change', (event) => onMediaQueryChange(event, 'mobile'));
	tabletMediaQuery.addEventListener('change', (event) => onMediaQueryChange(event, 'tablet'));
	desktopMediaQuery.addEventListener('change', (event) => onMediaQueryChange(event, 'desktop'));

	onMediaQueryChange(mobileMediaQuery, 'mobile');
	onMediaQueryChange(tabletMediaQuery, 'tablet');
	onMediaQueryChange(desktopMediaQuery, 'desktop');

};

export default breakpointChangeEvent;
