/**
 * @module initialize
 */

import handlebarsHelpers from './config/handlebarsHelpers';
import Application from './Application.js';

document.addEventListener('DOMContentLoaded', function(event) {
	handlebarsHelpers();
	Application.initialize();
});
