let hls = null;
let audioElement = null;

function openPlayer(title, ...urls) {
  const overlay = document.getElementById('player-overlay');
  const video = document.getElementById('video-player');
  const titleEl = document.getElementById('video-title');

  titleEl.textContent = title;
  overlay.style.display = 'flex';

  // Nettoyage
  if (audioElement) {
    audioElement.pause();
    audioElement.src = '';
    audioElement.remove();
    audioElement = null;
  }

  if (hls) {
    hls.destroy();
    hls = null;
  }

  video.pause();
  video.src = '';
  video.removeAttribute('src');
  video.crossOrigin = 'anonymous';
  video.controls = true;

  const hasSeparateAudio = urls.length === 2;
  const videoUrl = urls[0];
  const audioUrl = hasSeparateAudio ? urls[1] : null;

  // Si audio séparé, on prépare l'élément
  if (hasSeparateAudio) {
    audioElement = new Audio();
    audioElement.crossOrigin = 'anonymous';
    audioElement.src = audioUrl;

    // Sync audio avec la vidéo
    video.addEventListener('play', () => audioElement.play());
    video.addEventListener('pause', () => audioElement.pause());
    video.addEventListener('seeking', () => {
      audioElement.currentTime = video.currentTime;
    });
    video.addEventListener('ratechange', () => {
      audioElement.playbackRate = video.playbackRate;
    });
  }

  // Lecture via HLS.js
  if (Hls.isSupported()) {
    hls = new Hls({ xhrSetup: xhr => { xhr.withCredentials = false; } });
    hls.loadSource(videoUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (hasSeparateAudio) audioElement.play().catch(() => {});
      video.play().catch(() => {});
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoUrl;
    video.addEventListener('loadedmetadata', () => {
      if (hasSeparateAudio) audioElement.play().catch(() => {});
      video.play().catch(() => {});
    }, { once: true });
  } else {
    alert("Votre navigateur ne supporte pas la lecture HLS.");
  }
}

function closePlayer() {
  const overlay = document.getElementById('player-overlay');
  const video = document.getElementById('video-player');

  overlay.style.display = 'none';
  video.pause();
  video.src = '';
  video.removeAttribute('src');

  if (hls) {
    hls.destroy();
    hls = null;
  }

  if (audioElement) {
    audioElement.pause();
    audioElement.src = '';
    audioElement.remove();
    audioElement = null;
  }
}

// Fermer avec Échap
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('player-overlay').style.display === 'flex') {
    closePlayer();
  }
});
