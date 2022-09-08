/**
 * @module youtubeVideoControl
 * @description Manages multiple youtube iframe embed videos on a page
 */

const youtubeVideoControl = function() {
	const tag = document.createElement('script');
	tag.src = "//www.youtube.com/iframe_api";
	const firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	const elVideoPlayers = document.getElementsByClassName('video-player');
	if (!elVideoPlayers.length) {return;}

	let ytVideoPlayers = {};
	let currentVideoPlayer = null;

	function onStateChange(state) {
		const id = state.target.a.id;
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
	}

	window.onYouTubeIframeAPIReady = function() {
		// console.log('onYouTubeIframeAPIReady');
		for (let elVideo of elVideoPlayers) {
			const id = elVideo.id;
			ytVideoPlayers[id] = new YT.Player(id);
			ytVideoPlayers[id].addEventListener('onStateChange', function(state) {
				onStateChange(state);
			});
		}
	};

};

export default youtubeVideoControl;
