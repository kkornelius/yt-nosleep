const targetNode = document.body;

const config = { childList: true, subtree: true };

const callback = (mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            
            // --- FITUR 1: NONSTOP (Lanjutkan Menonton) ---
            const confirmButton = document.querySelector('tp-yt-paper-dialog #confirm-button');
            if (confirmButton && confirmButton.offsetParent !== null) {
                console.log("YT Extension: Mengklik tombol Continue watching...");
                confirmButton.click();
            }

            // --- FITUR 2: AUTO-SKIP IKLAN ---
            // Menggunakan beberapa kemungkinan class tombol skip YouTube
            const skipAdButton = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button');
            if (skipAdButton && skipAdButton.offsetParent !== null) {
                console.log("YT Extension: Iklan terdeteksi! Melakukan auto-skip...");
                skipAdButton.click();
            }
        }
    }
};

const observer = new MutationObserver(callback);
observer.observe(targetNode, config);

console.log("YT NonStop & Auto-Skip: Observer aktif dan memantau di latar belakang!");