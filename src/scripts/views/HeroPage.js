/**
 * Hero Page
 */

// import AppConfig from 'config/AppConfig';
import AppEvents from 'config/AppEvents';
import AppState from 'config/AppState';

const HeroPage = {

	initialize: function() {
		console.log('hero page');
		this.$scrollZoomParallaxBGs = $('.scroll-zoom-parallax');
		this.initScrollMagic();
	},

	initScrollMagic: function() {

		this.scrollController = new ScrollMagic.Controller({});
		this.parallaxScenes = [];

		for (let i=0, len = this.$scrollZoomParallaxBGs.length; i<len; i++) {
			let $bg = this.$scrollZoomParallaxBGs.eq(i);
			let $bgParent = $bg.closest('.hero');
			let bgTween = TweenMax.fromTo($bg, 1, {transform: 'scale(1)'}, {transform: 'scale(1.35)'});

			this.parallaxScenes[i] = new ScrollMagic.Scene({
					triggerElement: $bgParent,
					triggerHook: 'onLeave',
					offset: AppState.topOffset * -1,
					duration: '65%'
				})
				.setTween(bgTween)
				.addIndicators()
				.addTo(this.scrollController);
		}

	},

	uninitScrollMagic: function() {
		this.scrollController.destroy(true);
		this.parallaxScenes = null;
		TweenMax.set(this.$scrollZoomParallaxBGs, {clearProps: 'all'});
	},

	addEventListeners: function() {
		window.addEventListener(AppEvents.WINDOW_RESIZE_STOP, this._onWindowChange.bind(this));
		window.addEventListener(AppEvents.BREAKPOINT_CHANGE, this._onWindowChange.bind(this));
	},

	_onWindowChange: function() {
		this.uninitScrollMagic();
		// the scrollmagic destroy() method does not have a callback and appears to
		// behave asynchronously, so add a small delay before re-initializing.
		setTimeout(() => {
			this.initScrollMagic();
		}, 10);
	}

};

export default HeroPage;
