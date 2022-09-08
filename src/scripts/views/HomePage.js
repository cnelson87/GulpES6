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
		const xhr = ajaxGet(Constants.urls.homepageContent);

		Promise.resolve(xhr)
			.then((response) => {
				this.render(response);
			})
			.catch((error) => {
				console.warn(error);
			});
	},

	render(viewData) {
		const html = this.template(viewData);
		this.$el.html(html);
	}

};

export default HomePage;
