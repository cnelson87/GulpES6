/**
 * @module AppState
 * @description Defines application state
 */

const AppState = {

	// responsive breakpoints
	isMobileView: null,
	isTabletView: null,
	isDesktopView: null,
	currentBreakpoint: null,
	breakpoints: {
		1: 'mobile',
		2: 'tablet',
		3: 'desktop'
	},

	topOffset : 0

};

export default AppState;
