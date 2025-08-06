let hls = null;

function openPlayer(title, url) {
  const overlay = document.getElementById('player-overlay');
  const video   = document.getElementById('video-player');
  const titleEl = document.getElementById('video-title');

  // Affiche le lecteur
  titleEl.textContent = title;
  overlay.style.display = 'flex';

  // Détruit l'instance précédente si nécessaire
  if (hls) {
    hls.destroy();
    hls = null;
  }
  video.pause();
  video.src = '';
  video.removeAttribute('src');

  // Force la piste FR en nettoyant l'URL
  const urlFr = url.replace(
    /,lang\/eng\/[^,]+,lang\/fre\//,
    ',lang/fre/'
  );

  if (Hls.isSupported()) {
    hls = new Hls({ xhrSetup: xhr => { xhr.withCredentials = false; } });
    hls.loadSource(urlFr);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      // Sélectionne la piste audio FR si présente
      if (hls.audioTracks && hls.audioTracks.length > 0) {
        const frIndex = hls.audioTracks.findIndex(t =>
          (t.lang  && t.lang.toLowerCase().startsWith('fr')) ||
          (t.name  && t.name.toLowerCase().includes('fre'))
        );
        if (frIndex >= 0) hls.audioTrack = frIndex;
      }
      video.play().catch(() => {});
    });

  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = urlFr;
    video.addEventListener('loadedmetadata', () => {
      video.play().catch(() => {});
    }, { once: true });

  } else {
    alert("Votre navigateur ne supporte pas la lecture HLS.");
  }
}

function closePlayer() {
  const overlay = document.getElementById('player-overlay');
  const video   = document.getElementById('video-player');

  overlay.style.display = 'none';
  video.pause();
  video.src = '';
  video.removeAttribute('src');

  if (hls) {
    hls.destroy();
    hls = null;
  }
}

// Fermer le lecteur avec Échap
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('player-overlay').style.display === 'flex') {
    closePlayer();
  }
});
