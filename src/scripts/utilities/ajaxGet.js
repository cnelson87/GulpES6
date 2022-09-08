/**
 * @module ajaxGet
 * @description Returns an Ajax GET request using deferred.
 * @param: url is required, dataType & data are optional.
 * @return: json, html, or text
 */

const ajaxGet = function(url, dataType, data) {
	if (!url) {return;}
	const options = {
		type: 'GET',
		url: url,
		dataType: dataType || 'json',
		data: data || null,
	};
	return $.ajax(options);
};

export default ajaxGet;
