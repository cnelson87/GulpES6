/**
 * @module Application
 * @author Chris Nelson <cnelson87@gmail.com>
 */

import AppConfig from 'config/AppConfig';
import AppEvents from 'config/AppEvents';
import AppState from 'config/AppState';
import getQueryStringParams from 'utilities/getQueryStringParams';
import breakpointChangeEvent from 'utilities/breakpointChangeEvent';
import resizeStartStopEvents from 'utilities/resizeStartStopEvents';
import scrollStartStopEvents from 'utilities/scrollStartStopEvents';
import HomePage from 'views/HomePage';
import FormsPage from 'views/FormsPage';
import HeroPage from 'views/HeroPage';
import PromisePage from 'views/PromisePage';
import VideosPage from 'views/VideosPage';
import ResponsiveCarousel from 'widgets/ResponsiveCarousel';
import ResponsiveTabCarousel from 'widgets/ResponsiveTabCarousel';
import InfiniteCarousel from 'widgets/InfiniteCarousel';
import MiniAccordion from 'widgets/MiniAccordion';
import Accordion from 'widgets/Accordion';
import TabSwitcher from 'widgets/TabSwitcher';
import SelectTabSwitcher from 'widgets/SelectTabSwitcher';
import Horizordion from 'widgets/Horizordion';
import ModalWindow from 'widgets/ModalWindow';
import AjaxModal from 'widgets/AjaxModal';
import AjaxModalForm from 'widgets/AjaxModalForm';
import RangeSlider from 'widgets/RangeSlider';
import DateRangeSlider from 'widgets/DateRangeSlider';
// import {SuperClass, SubClass} from 'widgets/SuperSubClass';
import {SubClass} from 'widgets/SuperSubClass';

const Application = {

	initialize: function() {
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

		if (AppConfig.isIE10) {this.$html.addClass('ie10');}
		if (AppConfig.isIE11) {this.$html.addClass('ie11');}
		if (AppConfig.isEdge) {this.$html.addClass('edge');}
		if (AppConfig.isAndroid) {this.$html.addClass('android');}
		if (AppConfig.isIOS) {this.$html.addClass('ios');}

		if (!!queryParams || !!hashParams) {
			this.params = Object.assign({}, queryParams, hashParams);
			// console.log(hashParams);
			// console.log(queryParams);
			// console.log(this.params);
		}

		// Initialize custom events
		breakpointChangeEvent();
		resizeStartStopEvents();
		scrollStartStopEvents();

		this._addEventListeners();

		this.setTopOffset();

		// init specific page views
		switch(this.bodyID) {
			case 'homepage':
				this.initHomePage();
				break;
			case 'formspage':
				this.initFormsPage();
				break;
			case 'heropage':
				this.initHeroPage();
				break;
			case 'promisepage':
				this.initPromisePage();
				break;
			case 'videospage':
				this.initVideosPage();
				break;
			case 'carouselpage':
				this.initCarouselPage();
				break;
			case 'tabcarouselpage':
				this.initTabCarouselPage();
				break;
			case 'infinitecarouselpage':
				this.initInfiniteCarouselPage();
				break;
			case 'miniaccordionpage':
				this.initMiniAccordionPage();
				break;
			case 'accordionpage':
				this.initAccordionPage();
				break;
			case 'tabswitcherpage':
				this.initTabswitcherPage();
				break;
			case 'horizordionpage':
				this.initHorizordionPage();
				break;
			case 'modalspage':
				this.initModalsPage();
				break;
			case 'rangesliderpage':
				this.initRangeSliderPage();
				break;
			case 'testpage':
				this.initTestPage();
				break;
			default:
				//console.log('default');
		}

	},

	initHomePage: function() {
		HomePage.initialize();
	},

	initFormsPage: function() {
		FormsPage.initialize();
	},

	initHeroPage: function() {
		HeroPage.initialize();
	},

	initPromisePage: function() {
		PromisePage.initialize();
	},

	initVideosPage: function() {
		VideosPage.initialize();
	},

	initCarouselPage: function() {
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
	},

	initTabCarouselPage: function() {
		new ResponsiveTabCarousel($('#tabcarousel-m1-t1-d1'), {
			loopEndToEnd: false,
			autoRotate: true
		});
	},

	initInfiniteCarouselPage: function() {
		new InfiniteCarousel($('#infinite-carousel'), {});
	},

	initMiniAccordionPage: function() {
		let $miniAccordions = $('.accordion');
		for (let i=0, len=$miniAccordions.length; i<len; i++) {
			new MiniAccordion($miniAccordions.eq(i), {
				initialOpen: (i === 0) ? true : false,
			});
		}
	},

	initAccordionPage: function() {
		new Accordion($('#accordion-default'));
		new Accordion($('#accordion-custom'), {
			initialIndex: -1,
			equalizeHeight: true
		});
	},

	initTabswitcherPage: function() {
		new TabSwitcher($('#tabswitcher-default'));
		new TabSwitcher($('#tabswitcher-custom'), {
			equalizeHeight: true,
			autoRotate: true
		});
		new SelectTabSwitcher($('#select-tabswitcher'));
	},

	initHorizordionPage: function() {
		new Horizordion($('#horizordion-default'));
		new Horizordion($('#horizordion-custom'), {
			initialIndex: -1
		});
	},

	initModalsPage: function() {
		new ModalWindow();
		new AjaxModal();
		new AjaxModalForm();
	},

	initRangeSliderPage: function() {
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

	initTestPage: function() {
		// Super / Sub class demo
		new SubClass();
	},

	_addEventListeners: function() {
		window.addEventListener(AppEvents.WINDOW_RESIZE_START, this.onWindowResizeStart.bind(this));
		window.addEventListener(AppEvents.WINDOW_RESIZE_STOP, this.onWindowResizeStop.bind(this));
		window.addEventListener(AppEvents.WINDOW_SCROLL_START, this.onWindowScrollStart.bind(this));
		window.addEventListener(AppEvents.WINDOW_SCROLL_STOP, this.onWindowScrollStop.bind(this));
		window.addEventListener(AppEvents.BREAKPOINT_CHANGE, this.onBreakpointChange.bind(this));
	},

	_removeEventListeners: function() {
		window.removeEventListener(AppEvents.WINDOW_RESIZE_START, this.onWindowResizeStart.bind(this));
		window.removeEventListener(AppEvents.WINDOW_RESIZE_STOP, this.onWindowResizeStop.bind(this));
		window.removeEventListener(AppEvents.WINDOW_SCROLL_START, this.onWindowScrollStart.bind(this));
		window.removeEventListener(AppEvents.WINDOW_SCROLL_STOP, this.onWindowScrollStop.bind(this));
		window.removeEventListener(AppEvents.BREAKPOINT_CHANGE, this.onBreakpointChange.bind(this));
	},

	onWindowResizeStart: function() {
		// console.log('onWindowResizeStart');
	},

	onWindowResizeStop: function() {
		// console.log('onWindowResizeStop');
	},

	onWindowScrollStart: function() {
		// console.log('onWindowScrollStart');
	},

	onWindowScrollStop: function() {
		// console.log('onWindowScrollStop');
	},

	onBreakpointChange: function(params) {
		// console.log('onBreakpointChange', params);
		this.setTopOffset();
	},

	setTopOffset: function() {
		AppState.topOffset = this.$header.height();
	}

};

window.Application = Application;

export default Application;
