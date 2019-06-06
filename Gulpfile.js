//
// Packages
////////////////////////////////////////////////////////////////////////////
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const argv = require('yargs').argv;
const autoprefixer = require('gulp-autoprefixer');
const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const connect = require('gulp-connect');
const cssmin = require('gulp-cssmin');
const eslint = require('gulp-eslint');
const fileinclude = require('gulp-file-include');
const gulpif = require('gulp-if');
const hbsfy = require('hbsfy');
const livereload = require('gulp-livereload');
const pathmodify = require('pathmodify');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sasslint = require('gulp-sass-lint');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

//
// CONSTANTS
////////////////////////////////////////////////////////////////////////////
const PACKAGE = JSON.parse(fs.readFileSync('./package.json'));
const FILEPATHS = require('./filepaths.js');
const SRC = FILEPATHS.SRC;
const DEST = FILEPATHS.DEST;
const ENV = {
	DEV: 'local',
	PROD: 'public'
};
const ENVIRONMENT = (argv.dev) ? ENV.DEV : ENV.PROD;
const APP_NAME = PACKAGE.appName;
const PORT = PACKAGE.portNumber;
const LIVERELOAD_PORT = PACKAGE.livereloadPortNum;

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
	// let ret = gulp.dest(getSiteRoot() + '/' + (path || '').replace(/^\//, ''));
	// console.log(ret);
	return gulp.dest(getSiteRoot() + '/' + (path || '').replace(/^\//, ''));
}

//
// Tasks
////////////////////////////////////////////////////////////////////////////

gulp.task('clean', () => {
	return (
		gulp.src(DEST.ROOT+'/'+ENVIRONMENT, {read: false, allowEmpty: true}).pipe(clean())
	);
});

gulp.task('assets', () => {
	return (
		gulp.src(SRC.ASSETS)
			.pipe(out(DEST.ASSETS))
			.pipe(gulpif(isDev(), livereload()))
	);
});

gulp.task('data', () => {
	return (
		gulp.src(SRC.DATA)
			.pipe(out(DEST.DATA))
			.pipe(gulpif(isDev(), livereload()))
	);
});

gulp.task('html', () => {
	return (
		gulp.src([SRC.HTML, '!'+SRC.HTML_INCLUDES])
			.pipe(fileinclude({
				prefix: '@@',
				basepath: '@file',
				context: {
					appName: APP_NAME
				}
			}))
			.pipe(out())
			.pipe(gulpif(isDev(), livereload()))
	);
});

gulp.task('eslint', () => {
	return (
		gulp.src([SRC.SCRIPTS])
			.pipe(gulpif(isDev(), eslint()))
			.pipe(gulpif(isDev(), eslint.format()))
			.pipe(gulpif(isDev(), eslint.failOnError()))
	);
});

gulp.task('sasslint', () => {
	return (
		gulp.src([SRC.STYLES, '!'+SRC.STYLES_VENDOR])
			.pipe(gulpif(isDev(), sasslint()))
			.pipe(gulpif(isDev(), sasslint.format()))
			.pipe(gulpif(isDev(), sasslint.failOnError()))
	);
});

gulp.task('scripts', () => {
	const mods = [
		pathmodify.mod.dir('config', path.join(__dirname, './src/scripts/config')),
		pathmodify.mod.dir('utilities', path.join(__dirname, './src/scripts/utilities')),
		pathmodify.mod.dir('views', path.join(__dirname, './src/scripts/views')),
		pathmodify.mod.dir('widgets', path.join(__dirname, './src/scripts/widgets')),
		pathmodify.mod.dir('templates', path.join(__dirname, './src/templates'))
	];
	return (
		browserify({
			entries: SRC.SCRIPTS_ENTRY,
			debug: isDev()
		})
			.plugin(pathmodify, {mods: mods})
			.transform(hbsfy, { extensions: ['hbs'] })
			.transform(babelify, { presets: ['@babel/preset-env'] })
			.bundle()
			.pipe(source('app.js'))
			.pipe(buffer())
			.pipe(gulpif(isProd(), uglify()))
			.pipe(rename(APP_NAME+'.js'))
			.pipe(out(DEST.SCRIPTS))
			.pipe(gulpif(isDev(), livereload()))
	);
});

gulp.task('styles', () => {
	return (
		gulp.src(SRC.STYLES_ENTRY)
			.pipe(gulpif(isDev(), sourcemaps.init()))
			.pipe(sass())
			.pipe(autoprefixer())
			.pipe(gulpif(isDev(), sourcemaps.write('.')))
			.pipe(gulpif(isProd(), cssmin()))
			.pipe(rename(APP_NAME+'.css'))
			.pipe(out(DEST.STYLES))
			.pipe(gulpif(isDev(), livereload()))
	);
});

gulp.task('print', () => {
	return (
		gulp.src(SRC.PRINT_STYLES_ENTRY)
			.pipe(gulpif(isDev(), sourcemaps.init()))
			.pipe(sass())
			.pipe(autoprefixer())
			.pipe(gulpif(isDev(), sourcemaps.write('.')))
			.pipe(gulpif(isProd(), cssmin()))
			.pipe(out(DEST.STYLES))
			.pipe(gulpif(isDev(), livereload()))
	);
});

gulp.task('vendor', () => {
	return (
		gulp.src(SRC.VENDOR)
			.pipe(concat('vendor.js', {newLine: '\n\n'}))
			.pipe(out(DEST.SCRIPTS))
	);
});

gulp.task('server', gulp.series((done) => {
	connect.server({
		host: [], //accepts anything
		root: './' + getSiteRoot(),
		port: PORT,
		livereload: {
			enable: true,
			port: LIVERELOAD_PORT
		}
	});
	done();
}));

gulp.task('watch', gulp.series((done) => {
	livereload.listen({ port: LIVERELOAD_PORT });
	gulp.watch(SRC.ASSETS, gulp.series(['assets']));
	gulp.watch(SRC.DATA, gulp.series(['data']));
	gulp.watch(SRC.HTML, gulp.series(['html']));
	gulp.watch(SRC.SCRIPTS, gulp.series(['eslint', 'scripts']));
	gulp.watch(SRC.STYLES, gulp.series(['sasslint', 'styles']));
	gulp.watch(SRC.TEMPLATES, gulp.series(['scripts']));
	done();
}));

// build task
let tasks = [ 'clean', 'assets', 'data', 'html', 'eslint', 'scripts', 'sasslint', 'styles', 'print', 'vendor' ];
if (isDev()) {
	tasks.push('server', 'watch');
}
gulp.task('default', gulp.series(tasks, (done) => {
	done();
}));
