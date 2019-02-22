/**
 * Hero Page
 */

import Events from 'config/Events';
import State from 'config/State';

const HeroPage = {

	initialize() {
		// console.log('hero page');
		this.$scrollZoomParallaxBGs = $('.scroll-zoom-parallax');
		this.initScrollMagic();
	},

	initScrollMagic() {

		this.scrollController = new ScrollMagic.Controller({});
		this.parallaxScenes = [];

		for (let i=0, len = this.$scrollZoomParallaxBGs.length; i<len; i++) {
			let $bg = this.$scrollZoomParallaxBGs.eq(i);
			let $bgParent = $bg.closest('.hero');
			let bgTween = TweenMax.fromTo($bg, 1, {transform: 'scale(1)'}, {transform: 'scale(1.35)'});

			this.parallaxScenes[i] = new ScrollMagic.Scene({
					triggerElement: $bgParent,
					triggerHook: 'onLeave',
					offset: State.topOffset * -1,
					duration: '65%'
				})
				.setTween(bgTween)
				.addIndicators()
				.addTo(this.scrollController);
		}

	},

	uninitScrollMagic() {
		this.scrollController.destroy(true);
		this.parallaxScenes = null;
		TweenMax.set(this.$scrollZoomParallaxBGs, {clearProps: 'all'});
	},

	addEventListeners() {
		window.addEventListener(Events.WINDOW_RESIZE_END, this._onWindowChange.bind(this));
		window.addEventListener(Events.BREAKPOINT_CHANGE, this._onWindowChange.bind(this));
	},

	_onWindowChange() {
		this.uninitScrollMagic();
		// the scrollmagic destroy() method does not have a callback and appears to
		// behave asynchronously, so add a small delay before re-initializing.
		setTimeout(() => {
			this.initScrollMagic();
		}, 10);
	}

};

export default HeroPage;
