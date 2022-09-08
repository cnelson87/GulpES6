
const HeroPage = {

	initialize() {

		document.querySelectorAll('.scroll-zoom-parallax').forEach((elem) => {
			const tween = gsap.fromTo(elem, 1, {transform: 'scale(1)'}, {transform: 'scale(1.35)'});
			ScrollTrigger.create({
				animation: tween,
				trigger: elem.parentElement,
				start: 'top top',
				end: 'bottom top',
				scrub: true,
			});
		});

	}

};

export default HeroPage;
