/**
 * @module truncateText
 * @author Chris Nelson <cnelson87@gmail.com>
 * @description Truncate text and add ellipsis
 */

const truncateText = function() {
	let $els = $('[data-truncate]');
	let defaultLen = 200;
	console.log($els);
	$els.each((i, el) => {
		let $el = $(el);
		let text = $el.text();
		let len = $el.data('truncate') || defaultLen;
		if (text.length > len) {
			text = text.substring(0, len);
			text += '&hellip;';
		}
		$el.html(text);
	});

};

export default truncateText;
