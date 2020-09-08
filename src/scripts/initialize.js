/**
 * @module initialize
 */

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './polyfills';
import './plugins';
import './hbsHelpers';
import Application from './Application';

document.addEventListener('DOMContentLoaded', function(event) {
	Application.initialize();
});
