/**
 * @module State
 * @description Defines application state
 */

const State = {

	breakpoints: {
		1: 'mobile',
		2: 'tablet',
		3: 'desktop'
	},
	isMobileView: null,
	isTabletView: null,
	isDesktopView: null,
	currentBreakpoint: null,

	topOffset : 0,

};

export default State;
