let hls = null;
let audioElement = null;

function getAudioFrUrlFromVideoUrl(videoUrl) {
  const [base, query] = videoUrl.split('?');
  const match = base.match(/(.+\/)(index-[^\/]+)\.m3u8$/);

  if (!match) {
    console.error("URL vidéo non reconnue.");
    return null;
  }

  const basePath = match[1]; // exemple : .../08c2uz13tefl_x/
  return `${basePath}index-a2.m3u8${query ? '?' + query : ''}`;
}

function openPlayer(title, videoUrl) {
  const overlay = document.getElementById('player-overlay');
  const video = document.getElementById('video-player');
  const titleEl = document.getElementById('video-title');
  const audioUrl = getAudioFrUrlFromVideoUrl(videoUrl);

  if (!audioUrl) {
    alert("Impossible de déduire la piste audio FR.");
    return;
  }

  titleEl.textContent = title;
  overlay.style.display = 'flex';

  // Nettoyage
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

  video.pause();
  video.src = '';
  video.removeAttribute('src');

  // Création de l'élément audio pour la piste FR
  audioElement = document.createElement('audio');
  audioElement.crossOrigin = 'anonymous';
  audioElement.autoplay = true;
  audioElement.controls = false;
  audioElement.style.display = 'none';
  document.body.appendChild(audioElement);

  // Lecture de l'audio FR via hls.js
  if (Hls.isSupported()) {
    const audioHls = new Hls({ xhrSetup: xhr => { xhr.withCredentials = false; } });
    audioHls.loadSource(audioUrl);
    audioHls.attachMedia(audioElement);
  } else {
    audioElement.src = audioUrl;
  }

  // Lecture de la vidéo avec son coupé
  if (Hls.isSupported()) {
    hls = new Hls({ xhrSetup: xhr => { xhr.withCredentials = false; } });
    hls.loadSource(videoUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.muted = true;
      video.play().catch(() => {});
      audioElement.play().catch(() => {});
    });

  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoUrl;
    video.muted = true;
    video.addEventListener('loadedmetadata', () => {
      video.play().catch(() => {});
      audioElement.play().catch(() => {});
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

// Fermer avec la touche Échap
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('player-overlay').style.display === 'flex') {
    closePlayer();
  }
});
