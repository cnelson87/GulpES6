/**
 * initialize
 */

// is it still necessary to include 'babel-polyfill'
// when using the "babel-preset-env" package?
// import 'babel-polyfill';

import handlebarsHelpers from './config/handlebarsHelpers';
import Application from './Application.js';

document.addEventListener('DOMContentLoaded', function(event) {
	handlebarsHelpers();
	Application.initialize();
});
