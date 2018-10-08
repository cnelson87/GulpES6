/**
 * @module serializeFormFields
 * @author Chris Nelson <cnelson87@gmail.com>
 * @description Serialize form data
 * @param: jQuery $element required
 * @return: {}
 */

const serializeFormFields = function($el) {
	if (!$el) {return false;}
	if ($el.prop('tagName') === 'FORM') {
		return $el.serialize();
	}
	return $el.find('input, select, textarea').serialize();
};

export default serializeFormFields;
