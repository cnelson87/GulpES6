# GulpES6

A Gulp-based ES6 sandbox. Scripts are compiled using Browserify and transpiled using Babelify. All scripts are written as ES6 modules. Instantiable modules are written as ES6 classes.


## Base Dependencies

- Install Node.js: [NodeJS Installer](https://nodejs.org/)
- Install Gulp-CLI: `npm install gulp-cli -g` (https://gulpjs.com/)
- Optional / Recommended: Install Yarn: (https://yarnpkg.com/en/)


## NPM Modules

- CD into the root directory containing 'package.json'
- Install dependencies: `yarn install` or `npm install`


## Workflow

All development work should be done in the 'src' directory. Use the gulp commands below for running the project locally and processing for handoff to QA/Staging/Production.


## Gulp Commands

- `gulp` : Default task packages all files for delivery to staging or production, and outputs to a 'public' folder. Copies all static assets, lints and compiles javascript, lints and compiles SASS, optimizes JS and CSS
- `gulp --dev` : Same as default gulp command minus JS and CSS optimization, and outputs to a 'local' folder. Runs a local static server with automatic live-reloading, watches all files for changes.


## NPM scripts

- `npm run build` : npm script alias for `gulp`
- `npm start` : npm script alias for `gulp --dev`
