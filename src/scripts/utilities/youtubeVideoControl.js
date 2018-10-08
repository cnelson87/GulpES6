/**
 * @module youtubeVideoControl
 * @author Chris Nelson <cnelson87@gmail.com>
 * @description Manages multiple youtube iframe embed videos on a page
 */

const youtubeVideoControl = function() {
	let tag = document.createElement('script');
	tag.src = "//www.youtube.com/iframe_api";
	let firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	let elVideoPlayers = document.getElementsByClassName('video-player');
	if (!elVideoPlayers.length) {return;}

	let ytVideoPlayers = {};
	let currentVideoPlayer = null;

	let onStateChange = function(state) {
		let id = state.target.a.id;
		if (state.data === 0) {
			// console.log('ended');
			currentVideoPlayer = null;
		}
		if (state.data === 1) {
			// console.log('playing');
			if (currentVideoPlayer && currentVideoPlayer.a.id !== id) {
				currentVideoPlayer.pauseVideo();
			}
			currentVideoPlayer = ytVideoPlayers[id];
		}
		// if (state.data === 2) {
		// 	console.log('paused');
		// }

	};

	window.onYouTubeIframeAPIReady = function() {
		// console.log('onYouTubeIframeAPIReady');

		for (let elVideo of elVideoPlayers) {
			let id = elVideo.id;
			ytVideoPlayers[id] = new YT.Player(id);
			ytVideoPlayers[id].addEventListener('onStateChange', function(state) {
				onStateChange(state);
			});
		}

	};

};

export default youtubeVideoControl;
