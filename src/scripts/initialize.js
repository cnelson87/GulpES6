/**
 * @module initialize
 */

import '@babel/polyfill';
import './polyfills';
import './hbsHelpers';
import Application from './Application.js';

document.addEventListener('DOMContentLoaded', function(event) {
	Application.initialize();
});
