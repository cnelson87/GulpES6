/**
 * Videos Page
 */

import Constants from 'config/Constants';
import ajaxGet from 'utilities/ajaxGet';
import youtubeVideoControl from 'utilities/youtubeVideoControl';
import VideosGrid from 'templates/VideosGrid.hbs';

const VideosPage = {

	initialize() {
		this.$el = $('#videos-app');
		this.template = VideosGrid;
		this.fetch();
	},

	fetch() {
		let params = {
			part: 'id,snippet,contentDetails',
			maxResults: 50,
			playlistId: Constants.youtubePlaylistId,
			key: Constants.youtubeApiKey
		};
		let xhr = ajaxGet(Constants.urls.videosPlaylistDEV, 'json', params);

		Promise.resolve(xhr)
			.then((response) => {
				this.process(response);
			})
			.catch((error) => {
				// console.log(error);
			});
	},

	process(response) {
		// console.log(response);
		// let kind = response.kind; //not needed
		let viewData = response.items.map((item) => {
			return {
				videoId: item.contentDetails.videoId,
				title: item.snippet.title,
				description: item.snippet.description
			};
		});

		this.render(viewData);
	},

	render(viewData) {
		// console.log(viewData);
		let html = this.template(viewData);
		this.$el.html(html);
		youtubeVideoControl();
	}

};

export default VideosPage;
