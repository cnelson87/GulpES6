/**
 * Home Page
 */

import Constants from 'config/Constants';
import ajaxGet from 'utilities/ajaxGet';
import HomepageContent from 'templates/HomepageContent.hbs';

const HomePage = {

	initialize() {
		this.$el = $('#homepage-app');
		this.template = HomepageContent;
		this.fetch();
	},

	fetch() {
		let xhr = ajaxGet(Constants.urls.homepageContent);

		Promise.resolve(xhr)
			.then((response) => {
				this.render(response);
			})
			.catch((error) => {
				// console.log(error);
			});
	},

	render(viewData) {
		let html = this.template(viewData);
		this.$el.html(html);
	}

};

export default HomePage;
