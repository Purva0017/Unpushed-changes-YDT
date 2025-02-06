// Background service worker for future use
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
      homeFeed: true,
      upNext: true,
      shorts: true,
      comments: true,
      // Default values for all features
    });
  });