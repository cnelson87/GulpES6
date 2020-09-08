/**
 * @description jQuery plugin to shuffle elements in collection
 */

(function($) {

	$.fn.shuffle = function() {

		var allElems = this.get();
		var getRandom = function(max) {
			return Math.floor(Math.random() * max);
		};
		var shuffled = $.map(allElems, function() {
			var random = getRandom(allElems.length);
			var randEl = $(allElems[random]).clone(true)[0];
			allElems.splice(random, 1);
			return randEl;
		});

		this.each(function(i) {
			$(this).replaceWith($(shuffled[i]));
		});

		return $(shuffled);

	};

}(jQuery));
