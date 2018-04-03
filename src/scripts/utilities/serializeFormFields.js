/**
 * serializeFormFields
 * @author: Chris Nelson <cnelson87@gmail.com>
 * @description: Serialize form data
 * @param: jQuery $element required
 * @return: {}
 */

const serializeFormFields = function($el) {
	if (!$el) {return false;}
	return $el.find('input, select, textarea').serialize();
};

export default serializeFormFields;
