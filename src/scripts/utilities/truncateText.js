/**
 * @module truncateText
 * @description Truncate text and add ellipsis
 */

const truncateText = function() {
	const $els = $('[data-truncate]');
	const defaultLength = 200;

	$els.each((i, el) => {
		const $el = $(el);
		let text = $el.text();
		let len = $el.data('truncate') || defaultLength;
		if (text.length > len) {
			text = text.substring(0, len);
			text += '&hellip;';
		}
		$el.html(text);
	});

};

export default truncateText;
