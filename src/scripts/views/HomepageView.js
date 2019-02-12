/**
 * Homepage View
 */

import BaseView from 'views/BaseView';
import HomepageModel from 'models/Homepage/HomepageModel';
import tmplHomepageContent from 'templates/HomepageContent.hbs';

const HomepageView = BaseView.extend({

	initialize: function(options) {
		this.model = new HomepageModel();
		this.template = tmplHomepageContent;
		this._super(options);
		console.log('HomepageView:initialize');
	},

	render: function() {
		this._super();
		console.log('HomepageView:render');
		return this.$el;
	}

});

export default HomepageView;
