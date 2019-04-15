/**
 * @module PromisePage
 */

import Constants from 'config/Constants';
import ajaxGet from 'utilities/ajaxGet';
import PromiseDataListing from 'templates/PromiseDataListing.hbs';

const PromisePage = {

	initialize() {
		this.$el = $('#promise-app');
		this.template = PromiseDataListing;
		this.fetch();
	},

	fetch() {
		let xhrs = [
			ajaxGet(Constants.urls.fibonacci),
			ajaxGet(Constants.urls.primes),
			ajaxGet(Constants.urls.sevens)
		];

		Promise.all(xhrs)
			.then((response) => {
				this.process(response);
			})
			.catch((error) => {
				// console.log(error);
			});
	},

	process(response) {
		console.log(response);
		//combine response data into single array
		let list = [].concat(...response);
		//sort array numerically
		let sorted = list.slice().sort(function(a,b) {return a - b;});
		//convert to Set to remove duplicates
		let viewData = [...new Set(sorted)];

		this.render(viewData);
	},

	render(viewData) {
		// console.log(viewData);
		let html = this.template(viewData);
		this.$el.html(html);
	}

};

export default PromisePage;
