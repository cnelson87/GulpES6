/**
 * Videos Page
 */

import AppConfig from 'config/AppConfig';
import ajaxGet from 'utilities/ajaxGet';
import youtubeVideoControl from 'utilities/youtubeVideoControl';
import VideosGrid from 'templates/VideosGrid.hbs';

const VideosPage = {

	initialize: function() {
		this.$el = $('#videos-app');
		this.template = VideosGrid;
		this.fetch();
	},

	fetch: function() {
		let params = {
			part: 'id,snippet,contentDetails',
			maxResults: 50,
			playlistId: AppConfig.youtubePlaylistId,
			key: AppConfig.youtubeApiKey
		};
		let xhr = ajaxGet(AppConfig.urls.videosPlaylistDEV, 'json', params);

		Promise.resolve(xhr)
			.then((response) => {
				this.process(response);
			})
			.catch((error) => {
				// console.log(error);
			});
	},

	process: function(response) {
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

	render: function(viewData) {
		// console.log(viewData);
		let html = this.template(viewData);
		this.$el.html(html);
		youtubeVideoControl();
	}

};

export default VideosPage;
