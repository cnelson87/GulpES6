/**
 * Base View
 */

import LoaderSpinner from 'widgets/LoaderSpinner';

const BaseView = Backbone.View.extend({

	model: null,

	template: null,

	initialize: function(options) {
		console.log('BaseView:initialize');
		this.controller = options.controller;
		this.loader = new LoaderSpinner(this.$el);
		this.loader.addLoader();
		this.model.fetch().done(function(response) {
			this.render();
		}.bind(this));
	},

	render: function() {
		console.log('BaseView:render');
		let viewModel = this.model.attributes;
		let html = this.template(viewModel);
		let delay = 400;
		// Add delay to demonstrate loader
		setTimeout(function() {
			this.loader.removeLoader();
			this.$el.html(html);
		}.bind(this), delay);
	}

});

export default BaseView;
