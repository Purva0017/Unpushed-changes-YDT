document.addEventListener('DOMContentLoaded', async () => {
  const controls = document.getElementById('controls');
  const settings = {
    upNext: 'Video Sidebar',
    shorts: 'Hide Shorts',
    comments: 'Hide Comments',
    // Add all other features here
  };

  // Load saved settings
  const savedSettings = await chrome.storage.local.get(Object.keys(settings));

  // Create controls
  for (const [key, label] of Object.entries(settings)) {
    const wrapper = document.createElement('div');
    wrapper.className = 'control-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = key;
    checkbox.checked = savedSettings[key] || false;

    checkbox.addEventListener('change', async (e) => {
      await chrome.storage.local.set({ [key]: e.target.checked });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'UPDATE_SETTINGS' });
      });
    });

    wrapper.appendChild(checkbox);
    wrapper.appendChild(document.createTextNode(label));
    controls.appendChild(wrapper);
  }
});

const API_KEY = 'AIzaSyCUWbnQGIlQalfCit_cOfhcXVu3O_qZl-o';

document.getElementById('search-button').addEventListener('click', performSearch);
document.getElementById('search-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') performSearch();
});

async function performSearch() {
  const query = document.getElementById('search-input').value.trim();
  if (!query) return;
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`
    );
    
    if (!response.ok) throw new Error('YouTube API request failed');
    
    const data = await response.json();
    const searchResults = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      description: item.snippet.description
    }));
    
    // Send search results to content script
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'SHOW_SEARCH_RESULTS',
        results: searchResults,
        query: query
      });
    });
    
    // Close popup after search
    // window.close();
  } catch (error) {
    console.error('Error searching YouTube:', error);
    // Could add error handling UI here
  }
}