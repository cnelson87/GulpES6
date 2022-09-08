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
		const xhrs = [
			ajaxGet(Constants.urls.fibonacci),
			ajaxGet(Constants.urls.primes),
			ajaxGet(Constants.urls.triangle)
		];

		Promise.all(xhrs)
			.then((response) => {
				this.process(response);
			})
			.catch((error) => {
				console.warn(error);
			});
	},

	process(response) {
		console.log(response);
		//combine response data into single array
		const list = [].concat(...response);
		//sort array numerically
		const sorted = list.slice().sort(function(a,b) {return a - b;});
		//convert to Set to remove duplicates
		const viewData = [...new Set(sorted)];

		this.render(viewData);
	},

	render(viewData) {
		// console.log(viewData);
		const html = this.template(viewData);
		this.$el.html(html);
	}

};

export default PromisePage;
