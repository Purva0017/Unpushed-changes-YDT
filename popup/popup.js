document.addEventListener('DOMContentLoaded', async () => {
    const controls = document.getElementById('controls');
    const settings = {
      homeFeed: 'Hide Home Feed',
      upNext: 'Disable Up Next & Autoplay',
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
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'UPDATE_SETTINGS' });
        });
      });
  
      wrapper.appendChild(checkbox);
      wrapper.appendChild(document.createTextNode(label));
      controls.appendChild(wrapper);
    }
  
    document.getElementById('settings').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  });