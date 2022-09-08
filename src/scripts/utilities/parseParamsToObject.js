/**
 * @module parseParamsToObject
 * @description Reads query string and returns an object of name / value pairs.
 * @param: 'params' is required
 * @example: '?foo=bar&abc=123&bool=true&quxzot'
 * @return: {}
 */

const parseParamsToObject = function(params) {
	if (!params) {return;}
	// split string on '&' into array
	const pairs = params.split('&');
	if (!pairs.length) {return;}
	let result = {};
	pairs.forEach(function(pairStr) {
		let pair = pairStr.split('=');
		let key = pair[0];
		let val = pair[1] || null;
		if (val !== null) {
			//convert numbers first
			if (!isNaN(val)) {val = parseInt(val, 10);}
			//then convert booleans
			if (val === 'true') {val = true;}
			if (val === 'false') {val = false;}
		}
		result[key] = val;
	});
	return result;
};

export default parseParamsToObject;
