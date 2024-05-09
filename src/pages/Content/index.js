document.addEventListener('keydown', (e) => {
  const activeEle = document.activeElement;
  const videoEl = document.querySelector('ytd-player:not(ytd-video-preview ytd-player) video');
  const videoContainerEl = document.querySelector('#container');
  const playButton = document.querySelector('.ytp-play-button');

  // would only work if the activated element is
  // body
  // - video player container
  // - inside video player container
  if (activeEle === document.body
    || activeEle.contains(videoEl)
    || videoContainerEl.contains(activeEle)
  ) {
    if (e.code === 'Space') {
      // compare the state, if no change then toggles play state
      const curState = videoEl.paused;
      setTimeout(() => {
        if (videoEl.paused === curState) {
          playButton.click();
        }
      }, chrome.storage.local.get('delay') || 200);
    }
  }
})
