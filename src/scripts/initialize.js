/**
 * @module initialize
 */

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './polyfills';
import './hbsHelpers';
import Application from './Application.js';

document.addEventListener('DOMContentLoaded', function(event) {
	Application.initialize();
});
