/**
 * @module parseDatasetToObject
 * @description Reads dataset string and returns an object of name / value pairs.
 * @param: 'dataset' is required
 * @return: {}
 */

const parseDatasetToObject = function(dataset) {
	if (!dataset) {return;}
	// strip '{' and '}' from string and split on ',' into array
	const pairs = dataset.substring(1, dataset.length - 1).split(/, ?/);
	if (!pairs.length) {return;}
	let result = {};
	pairs.forEach(function(pairStr) {
		// split string on ':'
		let pair = pairStr.split(/: ?/);
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

export default parseDatasetToObject;
