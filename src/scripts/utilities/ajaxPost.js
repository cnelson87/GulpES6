/**
 * @module ajaxPost
 * @description Returns an Ajax POST response using deferred.
 * @param: url & data are required, contentType & dataType are optional.
 * @return: json, html, or text
 */

const ajaxPost = function(url, data, contentType, dataType) {
	if (!url || !data) {return;}
	return $.ajax({
		type: 'POST',
		url: url,
		data: data,
		contentType: contentType || 'application/json; charset=utf-8',
		dataType: dataType || 'json'
	});
};

export default ajaxPost;
