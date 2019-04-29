const FILEPATHS = {
	SRC: {
		ASSETS: 'src/assets/**/*',
		DATA: 'src/data/**/*',
		HTML: 'src/html/**/*.html',
		HTML_INCLUDES: 'src/html/_includes/**/*.html',
		SCRIPTS: 'src/scripts/**/*.js',
		SCRIPTS_ENTRY: [
			'./src/scripts/initialize.js'
		],
		STYLES: 'src/styles/**/*.scss',
		STYLES_VENDOR: 'src/styles/vendor/*.scss',
		STYLES_ENTRY: [
			'./src/styles/app.scss',
			'./src/styles/print.scss'
		],
		TEMPLATES: 'src/templates/**/*.hbs',
		VENDOR: [
			// 'src/vendor/modernizr.custom.min.js',
			'src/vendor/jquery.min.js',
			'src/vendor/jquery-ui.custom.min.js',
			'src/vendor/jquery.touchSwipe.min.js',
			'src/vendor/picturefill.min.js',
			'src/vendor/nouislider.min.js',
			'src/vendor/greensock/TweenMax.min.js',
			'src/vendor/greensock/ScrollToPlugin.min.js',
			'src/vendor/greensock/Draggable.min.js',
			'src/vendor/greensock/jquery.gsap.min.js',
			'src/vendor/scrollmagic/ScrollMagic.min.js',
			'src/vendor/scrollmagic/jquery.ScrollMagic.min.js',
			'src/vendor/scrollmagic/animation.gsap.min.js',
			'src/vendor/scrollmagic/debug.addIndicators.min.js',
			'src/vendor/validation/jquery.validate.min.js',
			'src/vendor/validation/additional-methods.min.js',
			'src/vendor/moment.min.js',
			'src/vendor/moment-timezone-with-data-10-year-range.min.js',
			'src/vendor/underscore.min.js'
		]
	},
	DEST: {
		ROOT: './_builds',
		DEV: 'local',
		PROD: 'public',
		ASSETS: '_assets',
		DATA: '_data',
		SCRIPTS: '_assets/scripts',
		STYLES: '_assets/styles'
	}
};

module.exports = FILEPATHS;
