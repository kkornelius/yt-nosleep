// content.js — YT Clean Tools v7.0

let currentVideoId = '';
let isLoopActive = false;

// Default settings (fallback kalau storage belum diset)
let settings = {
  adkiller: true,
  nonstop: true,
  buttons: true,
  screenshot: true,
  loop: true,
};

// ==========================================
// LOAD SETTINGS DARI POPUP (chrome.storage)
// ==========================================
chrome.storage.sync.get(settings, (data) => {
  settings = { ...settings, ...data };
  init();
});

// ==========================================
// FITUR: TOMBOL-TOMBOL AKSI DI BAWAH JUDUL
// ==========================================
const addActionButtons = (videoId) => {
  const titleContainer = document.querySelector('h1.ytd-watch-metadata');
  if (!titleContainer) return;

  const oldButtons = document.getElementById('custom-action-buttons');
  if (oldButtons) oldButtons.remove();

  const container = document.createElement('div');
  container.id = 'custom-action-buttons';
  container.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
    margin-bottom: 10px;
  `;

  const btnStyle = `
    background: #272727;
    color: white;
    padding: 8px 16px;
    border-radius: 18px;
    font-weight: 500;
    text-decoration: none;
    font-family: Roboto, Arial, sans-serif;
    font-size: 14px;
    border: 1px solid #3f3f3f;
    transition: background 0.2s;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    user-select: none;
  `;

  const addHover = (btn) => {
    btn.onmouseover = () => btn.style.background = '#3f3f3f';
    btn.onmouseout = () => {
      // Cek apakah ini loop button dalam state aktif
      if (btn.dataset.loopBtn && isLoopActive) {
        btn.style.background = '#ff0000';
      } else {
        btn.style.background = '#272727';
      }
    };
  };

  // --- Tombol Thumbnail ---
  if (settings.buttons) {
    const thumbBtn = document.createElement('a');
    thumbBtn.innerHTML = '🖼️ Thumbnail';
    thumbBtn.href = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    thumbBtn.target = '_blank';
    thumbBtn.style.cssText = btnStyle;
    addHover(thumbBtn);
    container.appendChild(thumbBtn);

    // --- Tombol Download Video ---
    const videoBtn = document.createElement('a');
    videoBtn.innerHTML = '🎬 Download Video';
    videoBtn.href = `https://ssyoutube.com/watch?v=${videoId}`;
    videoBtn.target = '_blank';
    videoBtn.style.cssText = btnStyle;
    addHover(videoBtn);
    container.appendChild(videoBtn);

    // --- Tombol Download MP3 (Auto-Copy Link) ---
    const mp3Btn = document.createElement('button'); // Kita ganti jadi elemen button
    mp3Btn.innerHTML = '🎵 Download MP3';
    mp3Btn.style.cssText = btnStyle;
    addHover(mp3Btn);

    mp3Btn.addEventListener('click', async () => {
      // Bikin full URL YouTube-nya
      const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      try {
        // Otomatis copy link ke clipboard
        await navigator.clipboard.writeText(ytUrl);
        
        // Ngasih tau user kalau link udah dicopy
        mp3Btn.innerHTML = '📋 Link Dicopy! (Tinggal Paste)';
        mp3Btn.style.background = '#2e7d32'; // Ganti warna ijo bentar
        
        setTimeout(() => { 
          mp3Btn.innerHTML = '🎵 Download MP3'; 
          mp3Btn.style.background = '#272727';
        }, 2500);

        // Buka web ytmp3
        window.open('https://ytmp3.gs/', '_blank');
      } catch (err) {
        console.error('Gagal copy link otomatis', err);
        // Kalau gagal copy tetep buka webnya
        window.open('https://ytmp3.gs/', '_blank'); 
      }
    });

    container.appendChild(mp3Btn);
  }

  // --- Tombol Screenshot Frame ---
  if (settings.screenshot) {
    const screenshotBtn = document.createElement('button');
    screenshotBtn.innerHTML = '📸 Screenshot';
    screenshotBtn.style.cssText = btnStyle;
    addHover(screenshotBtn);

    screenshotBtn.addEventListener('click', () => {
      const video = document.querySelector('video');
      if (!video) return;

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Format waktu buat nama file
      const time = Math.floor(video.currentTime);
      const mm = String(Math.floor(time / 60)).padStart(2, '0');
      const ss = String(time % 60).padStart(2, '0');
      const filename = `yt-screenshot-${videoId}-${mm}m${ss}s.png`;

      // Auto-download
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = filename;
      link.click();

      // Feedback visual
      screenshotBtn.innerHTML = '✅ Tersimpan!';
      setTimeout(() => screenshotBtn.innerHTML = '📸 Screenshot', 2000);
    });

    container.appendChild(screenshotBtn);
  }

  // --- Tombol Loop ---
  if (settings.loop) {
    const loopBtn = document.createElement('button');
    loopBtn.dataset.loopBtn = 'true';
    loopBtn.innerHTML = '🔁 Loop';
    loopBtn.style.cssText = btnStyle;
    loopBtn.style.background = isLoopActive ? '#ff0000' : '#272727';
    loopBtn.style.borderColor = isLoopActive ? '#cc0000' : '#3f3f3f';

    loopBtn.addEventListener('click', () => {
      const video = document.querySelector('video');
      if (!video) return;

      isLoopActive = !isLoopActive;
      video.loop = isLoopActive;

      // Update style
      loopBtn.style.background = isLoopActive ? '#ff0000' : '#272727';
      loopBtn.style.borderColor = isLoopActive ? '#cc0000' : '#3f3f3f';
      loopBtn.innerHTML = isLoopActive ? '🔁 Loop: ON' : '🔁 Loop';
    });

    addHover(loopBtn);
    container.appendChild(loopBtn);
  }

  titleContainer.parentElement.appendChild(container);
};

// ==========================================
// OBSERVER: AD-KILLER, NONSTOP & URL MONITORING
// ==========================================
const callback = (mutationsList) => {
  // 1. Cek perubahan video ID
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('v');

  if (videoId && videoId !== currentVideoId) {
    currentVideoId = videoId;
    isLoopActive = false; // Reset loop state saat ganti video
    setTimeout(() => addActionButtons(videoId), 1500);
  }

  // 2. Ad-Killer
  if (settings.adkiller) {
    const adShowing = document.querySelector('.ad-showing');
    if (adShowing) {
      const video = document.querySelector('video');
      if (video && !isNaN(video.duration)) {
        video.muted = true;
        video.currentTime = video.duration;
      }
    }

    // Auto-klik tombol skip iklan
    const skipBtn = document.querySelector(
      '.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button'
    );
    if (skipBtn && skipBtn.offsetParent !== null) {
      skipBtn.click();
    }
  }

  // 3. NonStop — Auto-klik "Continue watching"
  if (settings.nonstop) {
    const confirmBtn = document.querySelector('tp-yt-paper-dialog #confirm-button');
    if (confirmBtn && confirmBtn.offsetParent !== null) {
      confirmBtn.click();
    }
  }
};

// ==========================================
// INIT
// ==========================================
const init = () => {
  const observer = new MutationObserver(callback);
  observer.observe(document.body, { childList: true, subtree: true });

  // Jalankan sekali untuk video yang sudah terbuka
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('v');
  if (videoId) {
    currentVideoId = videoId;
    setTimeout(() => addActionButtons(videoId), 1500);
  }
};