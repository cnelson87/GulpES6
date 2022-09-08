const FILEPATHS = {
	SRC: {
		ASSETS: 'src/assets/**/*',
		DATA: 'src/data/**/*',
		HTML: 'src/html/**/*.html',
		HTML_INCLUDES: 'src/html/_includes/**/*.html',
		SCRIPTS: 'src/scripts/**/*.js',
		SCRIPTS_ENTRY: './src/scripts/index.js',
		STYLES: 'src/styles/**/*.scss',
		STYLES_VENDOR: 'src/styles/vendor/*.scss',
		STYLES_ENTRY: './src/styles/index.scss',
		PRINT_STYLES_ENTRY: './src/styles/print.scss',
		TEMPLATES: 'src/scripts/templates/**/*.hbs',
		VENDOR: [
			'src/vendor/jquery.min.js',
			'src/vendor/jquery-ui.custom.min.js',
			'src/vendor/jquery.touchSwipe.min.js',
			'src/vendor/jquery.easing.min.js',
			'src/vendor/validation/jquery.validate.min.js',
			'src/vendor/validation/additional-methods.min.js',
			'src/vendor/nouislider.min.js',
			'src/vendor/gsap/gsap.min.js',
			// 'src/vendor/gsap/Draggable.min.js',
			// 'src/vendor/gsap/ScrollToPlugin.min.js',
			'src/vendor/gsap/ScrollTrigger.min.js',
			'src/vendor/moment.min.js',
			'src/vendor/underscore-umd.min.js'
		]
	},
	DEST: {
		DEV: './_builds/dev',
		PROD: './_builds/prod',
		ASSETS: '_assets',
		DATA: '_assets/data',
		SCRIPTS: '_assets/scripts',
		STYLES: '_assets/styles'
	}
};

module.exports = FILEPATHS;
