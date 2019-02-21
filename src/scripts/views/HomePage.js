/**
 * Home Page
 */

import AppConfig from 'config/AppConfig';
import ajaxGet from 'utilities/ajaxGet';
import HomepageContent from 'templates/HomepageContent.hbs';

const HomePage = {

	initialize: function() {
		this.$el = $('#homepage-app');
		this.template = HomepageContent;
		this.fetch();
	},

	fetch: function() {
		let xhr = ajaxGet(AppConfig.urls.homepageContent);

		Promise.resolve(xhr)
			.then((response) => {
				this.render(response);
			})
			.catch((error) => {
				// console.log(error);
			});
	},

	render: function(viewData) {
		let html = this.template(viewData);
		this.$el.html(html);
	}

};

export default HomePage;
