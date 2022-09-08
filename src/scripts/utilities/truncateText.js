/**
 * @module truncateText
 * @description Truncate text and add ellipsis
 */

const truncateText = function() {
	const $els = $('[data-truncate]');
	const defaultLength = 200;

	$els.each((i, el) => {
		const $el = $(el);
		const len = $el.data('truncate') || defaultLength;
		let text = $el.text();
		if (text.length > len) {
			text = text.substring(0, len);
			text += '&hellip;';
		}
		$el.text(text);
	});

};

export default truncateText;
