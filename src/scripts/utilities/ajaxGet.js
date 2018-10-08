/**
 * @module ajaxGet
 * @author Chris Nelson <cnelson87@gmail.com>
 * @description Returns an Ajax GET request using deferred.
 * @param: url is required, dataType & data are optional.
 * @return: json, html, or text
 */

const ajaxGet = function(url, dataType, data) {
	if (!url) {return;}
	return $.ajax({
		type: 'GET',
		url: url,
		dataType: dataType || 'json',
		data: data || null
	});
};

export default ajaxGet;
