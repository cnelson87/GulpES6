import Constants from 'config/Constants';
import Events from 'config/Events';
import State from 'config/State';
import parseParamsToObject from 'utilities/parseParamsToObject';
import breakpointChangeEvent from 'utilities/breakpointChangeEvent';
import resizeBeginEndEvents from 'utilities/resizeBeginEndEvents';
import scrollBeginEndEvents from 'utilities/scrollBeginEndEvents';
import HomePage from 'views/HomePage';
import FormsPage from 'views/FormsPage';
import HeroPage from 'views/HeroPage';
import PromisePage from 'views/PromisePage';
import RangeSliderPage from 'views/RangeSliderPage';
import VideosPage from 'views/VideosPage';
import Accordion from 'widgets/Accordion';
import MiniAccordion from 'widgets/MiniAccordion';
import ResponsiveCarousel from 'widgets/ResponsiveCarousel';
import ResponsiveTabCarousel from 'widgets/ResponsiveTabCarousel';
import InfiniteCarousel from 'widgets/InfiniteCarousel';
import HeroCarousel from 'widgets/HeroCarousel';
import TabSwitcher from 'widgets/TabSwitcher';
import SelectTabSwitcher from 'widgets/SelectTabSwitcher';
import Horizordion from 'widgets/Horizordion';
import ModalWindow from 'widgets/ModalWindow';
import AjaxModal from 'widgets/AjaxModal';
import AjaxModalForm from 'widgets/AjaxModalForm';
// import { SuperClass, SubClass } from 'widgets/SuperSubClass';
// import { SubClass } from 'widgets/SuperSubClass';

const Application = {

	initialize() {
		// console.log('Application:initialize');
		const urlSearch = decodeURIComponent(location.search.substring(1)) || null;
		const urlHash = location.hash.substring(1) || null;
		const searchParams = urlSearch ? parseParamsToObject(urlSearch) : null;
		const hashParams = urlHash ? parseParamsToObject(urlHash) : null;

		this.params = null;

		if (Constants.isAndroid) {document.documentElement.classList.add('android');}
		if (Constants.isIOS) {document.documentElement.classList.add('ios');}

		if (!!searchParams || !!hashParams) {
			this.params = Object.assign({}, searchParams, hashParams);
			// console.log(searchParams);
			// console.log(hashParams);
			// console.log(this.params);
		}

		this._addEventListeners();

		// Initialize custom events
		breakpointChangeEvent();
		resizeBeginEndEvents();
		scrollBeginEndEvents();

		this.setTopOffset();

		// init widgets globally
		this.initWidgets();
		this.initModals();

		// init specific page views
		this.initPageViews();

	},

	widgetsMap: {
		'Accordion': Accordion,
		'HeroCarousel': HeroCarousel,
		'Horizordion': Horizordion,
		'InfiniteCarousel': InfiniteCarousel,
		'MiniAccordion': MiniAccordion,
		'ResponsiveCarousel': ResponsiveCarousel,
		'ResponsiveTabCarousel': ResponsiveTabCarousel,
		'SelectTabSwitcher': SelectTabSwitcher,
		'TabSwitcher': TabSwitcher,
	},

	pageViewsMap: {
		homepage: HomePage,
		formspage: FormsPage,
		heropage: HeroPage,
		promisepage: PromisePage,
		rangesliderpage: RangeSliderPage,
		videospage: VideosPage,
	},

	initPageViews() {
		const bodyID = document.body.id;
		const PageView = bodyID && this.pageViewsMap[bodyID] || null;
		if (PageView) {
			PageView.initialize();
		}
	},

	initWidgets() {
		// init all nested widgets first since they can affect parent size & position
		document.querySelectorAll('[data-widget] [data-widget]:not(.is-initialized)').forEach((elem) => {
			const Widget = this.widgetsMap[elem.dataset.widget] || null;
			if (Widget) {
				new Widget(elem);
			}
		});
		// then init all top-level widgets
		document.querySelectorAll('[data-widget]:not(.is-initialized)').forEach((elem) => {
			const Widget = this.widgetsMap[elem.dataset.widget] || null;
			if (Widget) {
				new Widget(elem);
			}
		});
		// Super / Sub class demo
		// new SubClass();
	},

	initModals() {
		new ModalWindow();
		new AjaxModal();
		new AjaxModalForm();
	},

	_addEventListeners() {
		window.addEventListener(Events.BREAKPOINT_CHANGE, this.onBreakpointChange.bind(this));
		window.addEventListener(Events.WINDOW_RESIZE_BEGIN, this.onWindowResizeBegin.bind(this));
		window.addEventListener(Events.WINDOW_RESIZE_END, this.onWindowResizeEnd.bind(this));
		window.addEventListener(Events.WINDOW_SCROLL_BEGIN, this.onWindowScrollBegin.bind(this));
		window.addEventListener(Events.WINDOW_SCROLL_END, this.onWindowScrollEnd.bind(this));
	},

	_removeEventListeners() {
		window.removeEventListener(Events.BREAKPOINT_CHANGE, this.onBreakpointChange.bind(this));
		window.removeEventListener(Events.WINDOW_RESIZE_BEGIN, this.onWindowResizeBegin.bind(this));
		window.removeEventListener(Events.WINDOW_RESIZE_END, this.onWindowResizeEnd.bind(this));
		window.removeEventListener(Events.WINDOW_SCROLL_BEGIN, this.onWindowScrollBegin.bind(this));
		window.removeEventListener(Events.WINDOW_SCROLL_END, this.onWindowScrollEnd.bind(this));
	},

	onWindowResizeBegin() {
		// console.log('onWindowResizeBegin');
	},

	onWindowResizeEnd() {
		// console.log('onWindowResizeEnd');
	},

	onWindowScrollBegin() {
		// console.log('onWindowScrollBegin');
	},

	onWindowScrollEnd() {
		// console.log('onWindowScrollEnd');
	},

	onBreakpointChange(event) {
		// console.log('onBreakpointChange', event.detail);
		// console.log('State.currentBreakpoint', State.currentBreakpoint);
		this.setTopOffset();
	},

	setTopOffset() {
		State.topOffset = document.getElementById('header').offsetHeight;
	}

};

window.Application = Application;

export default Application;
