/**
 * Promise Page
 */

import AppConfig from 'config/AppConfig';
import ajaxGet from 'utilities/ajaxGet';
import PromiseDataListing from 'templates/PromiseDataListing.hbs';

const PromisePage = {

	initialize: function() {
		this.$el = $('#promise-app');
		this.template = PromiseDataListing;
		this.fetch();
	},

	fetch: function() {
		let xhrs = [
			ajaxGet(AppConfig.urls.fibonacci),
			ajaxGet(AppConfig.urls.primes),
			ajaxGet(AppConfig.urls.sevens)
		];

		Promise.all(xhrs)
			.then((response) => {
				this.process(response);
			})
			.catch((error) => {
				// console.log(error);
			});
	},

	process: function(response) {
		console.log(response);
		//combine response data into single array
		let list = [].concat(...response);
		//sort array numerically
		let sorted = list.slice().sort(function(a,b) {return a - b;});
		//convert to Set to remove duplicates
		let viewData = [...new Set(sorted)];

		this.render(viewData);
	},

	render: function(viewData) {
		// console.log(viewData);
		let html = this.template(viewData);
		this.$el.html(html);
	}

};

export default PromisePage;
