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
		const params = {
			part: 'id,snippet,contentDetails',
			maxResults: 50,
			playlistId: Constants.youtubePlaylistId,
			key: Constants.youtubeApiKey
		};
		const xhr = ajaxGet(Constants.urls.videosPlaylistLIVE, 'json', params);

		Promise.resolve(xhr)
			.then((response) => {
				this.process(response);
			})
			.catch((error) => {
				console.warn(error);
			});
	},

	process(response) {
		// console.log(response);
		// const kind = response.kind; //not needed
		const viewData = response.items.map((item) => {
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
		const html = this.template(viewData);
		this.$el.html(html);
		youtubeVideoControl();
	}

};

export default VideosPage;
