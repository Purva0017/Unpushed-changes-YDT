const selectors = {
    homeFeed: ['ytd-browse[page-subtype="home"]', '#contents.ytd-rich-grid-renderer'],
    upNext: ['#related', '#autoplay-checkbox'],
    shorts: ['[is-shorts]', '#items [title="Shorts"]'],
    comments: ['#comments'],   // , '#sections'
    // Add all other selectors here
  };
  
  let observer = new MutationObserver(applySettings);
  let currentSettings = {};
  
  async function init() {
    currentSettings = await chrome.storage.local.get(null);
    applySettings();
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class', 'id']
    });
  }
  
  function applySettings() {
    Object.entries(selectors).forEach(([feature, selectors]) => {
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          element.style.display = currentSettings[feature] ? 'none' : '';
          element.classList.toggle('youdifytube-hidden', currentSettings[feature]);
        });
      });
    });
  }
  
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'UPDATE_SETTINGS') {
      chrome.storage.local.get(null).then(settings => {
        currentSettings = settings;
        applySettings();
      });
    }
  });
  
  // Initialize with debounce
  let initTimeout;
  document.addEventListener('DOMContentLoaded', () => {
    clearTimeout(initTimeout);
    initTimeout = setTimeout(init, 300);
  });