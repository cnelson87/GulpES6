/**
 * @module Application
 */

import Constants from 'config/Constants';
import Events from 'config/Events';
import State from 'config/State';
import getQueryStringParams from 'utilities/getQueryStringParams';
import breakpointChangeEvent from 'utilities/breakpointChangeEvent';
import resizeBeginEndEvents from 'utilities/resizeBeginEndEvents';
import scrollBeginEndEvents from 'utilities/scrollBeginEndEvents';
import HomePage from 'views/HomePage';
import FormsPage from 'views/FormsPage';
import HeroPage from 'views/HeroPage';
import PromisePage from 'views/PromisePage';
import VideosPage from 'views/VideosPage';
import Accordion from 'widgets/Accordion';
import MiniAccordion from 'widgets/MiniAccordion';
import ResponsiveCarousel from 'widgets/ResponsiveCarousel';
import ResponsiveTabCarousel from 'widgets/ResponsiveTabCarousel';
import InfiniteCarousel from 'widgets/InfiniteCarousel';
import TabSwitcher from 'widgets/TabSwitcher';
import SelectTabSwitcher from 'widgets/SelectTabSwitcher';
import Horizordion from 'widgets/Horizordion';
import ModalWindow from 'widgets/ModalWindow';
import AjaxModal from 'widgets/AjaxModal';
import AjaxModalForm from 'widgets/AjaxModalForm';
import RangeSlider from 'widgets/RangeSlider';
import DateRangeSlider from 'widgets/DateRangeSlider';
// import { SuperClass, SubClass } from 'widgets/SuperSubClass';
import { SubClass } from 'widgets/SuperSubClass';

const Application = {

	initialize() {
		// console.log('Application:initialize');
		let urlHash = location.hash.substring(1) || null;
		let hashParams = urlHash ? getQueryStringParams(urlHash) : null;
		let queryParams = getQueryStringParams();

		this.$window = $(window);
		this.$document = $(document);
		this.$html = $('html');
		this.$body = $('body');
		this.$header = $('#header');
		this.$footer = $('#footer');

		this.bodyID = this.$body.attr('id');

		this.params = null;

		if (Constants.isIE10) {this.$html.addClass('ie10');}
		if (Constants.isIE11) {this.$html.addClass('ie11');}
		if (Constants.isEdge) {this.$html.addClass('edge');}
		if (Constants.isAndroid) {this.$html.addClass('android');}
		if (Constants.isIOS) {this.$html.addClass('ios');}

		if (!!queryParams || !!hashParams) {
			this.params = Object.assign({}, queryParams, hashParams);
			// console.log(hashParams);
			// console.log(queryParams);
			// console.log(this.params);
		}

		// Initialize custom events
		breakpointChangeEvent();
		resizeBeginEndEvents();
		scrollBeginEndEvents();

		this._addEventListeners();

		this.setTopOffset();

		// init specific page view
		if (typeof this.pagemap[this.bodyID] !== 'undefined') {
			this[this.pagemap[this.bodyID]]();
		}
	},

	pagemap: {
		homepage: 'initHomePage',
		formspage: 'initFormsPage',
		heropage: 'initHeroPage',
		promisepage: 'initPromisePage',
		videospage: 'initVideosPage',
		widgetspage: 'initWidgetsPage',
		horizordionpage: 'initHorizordionPage',
		modalspage: 'initModalsPage',
		rangesliderpage: 'initRangeSliderPage',
		testpage: 'initTestPage',
	},

	initHomePage() {
		HomePage.initialize();
	},

	initFormsPage() {
		FormsPage.initialize();
	},

	initHeroPage() {
		HeroPage.initialize();
	},

	initPromisePage() {
		PromisePage.initialize();
	},

	initVideosPage() {
		VideosPage.initialize();
	},

	initWidgetsPage() {
		const $miniAccordions = $('.mini-accordion');

		new Accordion($('#accordion-default'));

		new Accordion($('#accordion-custom'), {
			initialIndex: -1,
			equalizeHeight: true
		});

		new ResponsiveCarousel($('#carousel-m1-t1-d1'), {
			loopEndToEnd: false,
			autoRotate: true
		});

		new ResponsiveCarousel($('#carousel-m1-t2-d3'), {
			numVisibleItemsMobile: 1,
			numItemsToAnimateMobile: 1,
			numVisibleItemsTablet: 2,
			numItemsToAnimateTablet: 1,
			numVisibleItemsDesktop: 3,
			numItemsToAnimateDesktop: 2,
			loopEndToEnd: true,
			autoRotate: false
		});

		new ResponsiveCarousel($('#carousel-m1-t3-d5'), {
			numVisibleItemsMobile: 1,
			numItemsToAnimateMobile: 1,
			numVisibleItemsTablet: 3,
			numItemsToAnimateTablet: 2,
			numVisibleItemsDesktop: 5,
			numItemsToAnimateDesktop: 4,
			loopEndToEnd: true,
			staggerActiveItems: true,
			autoRotate: false
		});

		new ResponsiveTabCarousel($('#tabcarousel-m1-t1-d1'), {
			loopEndToEnd: false,
			autoRotate: true
		});

		new InfiniteCarousel($('#infinite-carousel'));

		$miniAccordions.each((index) => {
			new MiniAccordion($miniAccordions.eq(index), {
				initialOpen: (index === 0) ? true : false,
			});
		});

		new TabSwitcher($('#tabswitcher-default'));

		new TabSwitcher($('#tabswitcher-custom'), {
			equalizeHeight: true,
			autoRotate: true
		});

		new SelectTabSwitcher($('#select-tabswitcher'));

	},

	initHorizordionPage() {
		new Horizordion($('#horizordion-default'));
		new Horizordion($('#horizordion-custom'), {
			initialIndex: -1
		});
	},

	initModalsPage() {
		new ModalWindow();
		new AjaxModal();
		new AjaxModalForm();
	},

	initRangeSliderPage() {
		/* eslint-disable no-magic-numbers */
		new RangeSlider($('#range-slider'), {
			sliderSteps: 1
		});
		new DateRangeSlider($('#date-range-slider'), {
			sliderSteps: (60 * 60 * 1000) // 1 hr
		});
		new DateRangeSlider($('#time-range-slider'), {
			sliderSteps: (15 * 60 * 1000) // 15 min
		});
		/* eslint-enable no-magic-numbers */
	},

	initTestPage() {
		// Super / Sub class demo
		new SubClass();
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

	onBreakpointChange(params) {
		// console.log('onBreakpointChange', params);
		this.setTopOffset();
	},

	setTopOffset() {
		State.topOffset = this.$header.height();
	}

};

window.Application = Application;

export default Application;
