//
// Packages
////////////////////////////////////////////////////////////////////////////
const gulp = require('gulp');
const argv = require('yargs').argv;
const autoprefixer = require('gulp-autoprefixer');
const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const concat = require('gulp-concat');
const cssmin = require('gulp-cssmin');
const eslint = require('gulp-eslint');
const gulpif = require('gulp-if');
const hbsfy = require('hbsfy');
const livereload = require('gulp-livereload');
const sass = require('gulp-sass');
const sasslint = require('gulp-sass-lint');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

//
// CONSTANTS
////////////////////////////////////////////////////////////////////////////
// const PACKAGE = require('./package.json');
const PATHS = require('./paths.js');
const SRC = PATHS.SRC;
const DEST = PATHS.DEST;
const ENV = {
	DEV: 'local',
	PROD: 'public'
};
const ENVIRONMENT = (argv.dev) ? ENV.DEV : ENV.PROD;
const PORT = 8999;
const LIVERELOAD_PORT = 30999;

//
// Utils
////////////////////////////////////////////////////////////////////////////

function isDev() {
	return (ENVIRONMENT === ENV.DEV);
}
function isProd() {
	return (ENVIRONMENT === ENV.PROD);
}
function getSiteRoot() {
	// console.log(DEST.ROOT + '/' + ENVIRONMENT);
	return (DEST.ROOT + '/' + ENVIRONMENT);
}
function out(path) {
	// var ret = gulp.dest(getSiteRoot() + '/' + (path || '').replace(/^\//, ''));
	// console.log(ret);
	return gulp.dest(getSiteRoot() + '/' + (path || '').replace(/^\//, ''));
}

//
// Tasks
////////////////////////////////////////////////////////////////////////////

gulp.task('assets', function() {
	return gulp.src(SRC.ASSETS)
		.pipe(out(DEST.ASSETS));
});

gulp.task('data', function() {
	return gulp.src(SRC.DATA)
		.pipe(out(DEST.DATA));
});

gulp.task('html', function() {
	//TODO: create task to compile HTML from partials
	return gulp.src(SRC.HTML)
		.pipe(out());
});

gulp.task('eslint', function() {
	return gulp.src([SRC.SCRIPTS])
		.pipe(gulpif(isDev(), eslint()))
		.pipe(gulpif(isDev(), eslint.format()))
		.pipe(gulpif(isDev(), eslint.failOnError()))
});

gulp.task('sasslint', function() {
	return gulp.src([SRC.STYLES, '!'+SRC.STYLES_VENDOR])
		.pipe(gulpif(isDev(), sasslint()))
		.pipe(gulpif(isDev(), sasslint.format()))
		.pipe(gulpif(isDev(), sasslint.failOnError()))
});

gulp.task('scripts', function() {
	var b = browserify({
		entries: SRC.SCRIPTS_ENTRY,
		debug: isDev()
	});
	return b
		.transform(hbsfy, {
			extensions: ['hbs']
		})
		.transform(babelify, {
			presets: ['env']
		})
		.bundle()
		.pipe(source('app.js'))
		.pipe(buffer())
		.pipe(gulpif(isProd(), uglify()))
		.pipe(out(DEST.SCRIPTS))
		.pipe(gulpif(isDev(), livereload()))
});

gulp.task('styles', function() {
	return gulp.src(SRC.STYLES_ENTRY)
		.pipe(gulpif(isDev(), sourcemaps.init()))
		.pipe(sass())
		.pipe(autoprefixer({
			browsers: ['last 5 versions', 'safari >= 10', 'ie >= 10']
		}))
		.pipe(gulpif(isDev(), sourcemaps.write('.')))
		.pipe(gulpif(isProd(), cssmin()))
		.pipe(out(DEST.STYLES))
		.pipe(gulpif(isDev(), livereload()))
});

gulp.task('vendor', function() {
	return gulp.src(SRC.VENDOR)
		.pipe(concat('vendor.js'))
		.pipe(out(DEST.SCRIPTS))
});

gulp.task('watch', function() {
	livereload.listen({ port: LIVERELOAD_PORT });
	gulp.watch(SRC.ASSETS, ['assets']);
	gulp.watch(SRC.DATA, ['data']);
	gulp.watch(SRC.HTML, ['html']);
	gulp.watch(SRC.SCRIPTS, ['eslint', 'scripts']);
	gulp.watch(SRC.STYLES, ['sasslint', 'styles']);
	gulp.watch(SRC.TEMPLATES, ['scripts']);
});

// build task
let buildTasks = [ 'assets', 'data', 'html', 'eslint', 'scripts', 'sasslint', 'styles', 'vendor' ];
if (isDev()) {
	// buildTasks.push('connect');
	buildTasks.push('watch');
}
gulp.task('build', buildTasks, function() {
	// process.nextTick(function() {
	// 	gutil.log(DIVIDER);
	// 	if (isDev()) {
	// 		notification('Gulp Ready');
	// 	}
	// });
});

// default task
gulp.task('default', function() {
	gulp.start('build');
});
