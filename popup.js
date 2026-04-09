const keys = ['adkiller', 'nonstop', 'buttons', 'screenshot', 'loop'];

const defaults = {
  adkiller: true,
  nonstop: true,
  buttons: true,
  screenshot: true,
  loop: true,
};

chrome.storage.sync.get(defaults, (data) => {
  keys.forEach((key) => {
    const el = document.getElementById(`toggle-${key}`);
    if (el) el.checked = data[key];
  });
});

keys.forEach((key) => {
  const el = document.getElementById(`toggle-${key}`);
  if (el) {
    el.addEventListener('change', () => {
      chrome.storage.sync.set({ [key]: el.checked });
    });
  }
});