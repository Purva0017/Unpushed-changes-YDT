document.addEventListener('DOMContentLoaded', async () => {
  const controls = document.getElementById('controls');
  const settings = {
    homeFeed: 'Hide Home Feed',
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

document.getElementById('addTopic').addEventListener('click', function () {
  const topicInput = document.getElementById('topicInput');
  const topic = topicInput.value.trim();
  if (topic === '') return;

  const topicList = document.getElementById('topicList');
  const topicItem = document.createElement('div');
  topicItem.className = 'topic-item';
  topicItem.innerHTML = `<span>${topic}</span> <button class="remove">&times;</button>`;
  topicItem.classList.add("btn", "btn-light", "rounded-pill")
  topicItem.style.display = 'inline-flex';
  topicItem.style.alignItems = 'center'

  topicList.appendChild(topicItem);
  topicInput.value = '';

  topicItem.querySelector('.remove').addEventListener('click', function () {
    topicList.removeChild(topicItem);
  });
});