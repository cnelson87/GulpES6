# GulpES6

A Gulp-based ES6 sandbox. Scripts are compiled using Browserify and transpiled using Babelify. All scripts are written as ES6 modules. Instantiable modules are written as ES6 classes.


## Base Dependencies

- node/npm (https://nodejs.org/)
- gulp (https://gulpjs.com/)


## NPM Modules

- CD into the repo where `package.json` lives
- Install dependencies: `npm install`


## Workflow

All development work should be done in the 'src' directory. Use the grunt commands below for running the project locally and processing for handoff to QA/Staging/Production.


## Using gulp in the Terminal

`cd` to the trunk directory with the Gulpfile.js and use the following commands:
- `gulp` : Default task packages all files for delivery to staging or production, and outputs to a 'public' folder. Copies all static assets, lints and compiles javascript, lints and compiles SASS, optimizes JS and CSS
- `gulp --dev` : Same as default task minus JS and CSS optimization, runs a local static server with automatic live-reloading on port http://localhost:8376, watches all files for changes.


## NPM scripts

- `npm run build` : npm script alias for `gulp`
- `npm start`     : npm script alias for `gulp --dev`
