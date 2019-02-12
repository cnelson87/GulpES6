/**
 * Homepage Model
 */

import AppConfig from 'config/AppConfig';

const HomepageModel = Backbone.Model.extend({

	url: AppConfig.urls.homepageContent,

	initialize: function(options) {
		console.log('HomepageModel:initialize');
	}

});

export default HomepageModel;
