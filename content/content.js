const selectors = {
  homeFeed: [
    'ytd-browse[page-subtype="home"]',
    "#contents.ytd-rich-grid-renderer",
  ],
  upNext: ["#related", "#autoplay-checkbox"],
  shorts: ["[is-shorts]", '#items [title="Shorts"]'],
  comments: ["#comments"], // , '#sections'
  // Add all other selectors here
};

let observer = new MutationObserver(applySettings);
let currentSettings = {};

function createYouTubeVideoElement(video) {
  // Create a YouTube-like video element
  const videoItem = document.createElement("ytd-rich-item-renderer");
  videoItem.className = "style-scope ytd-rich-grid-row";
  videoItem.innerHTML = `
    <div id="content" class="style-scope ytd-rich-item-renderer">
      <ytd-rich-grid-media class="style-scope ytd-rich-item-renderer">
        <div id="dismissible" class="style-scope ytd-rich-grid-media">
          <ytd-thumbnail class="style-scope ytd-rich-grid-media">
            <a id="thumbnail" class="yt-simple-endpoint style-scope ytd-thumbnail" href="/watch?v=${video.id}">
              <img src="${video.thumbnail}" alt="${video.title}" style="width:100%;height:100%">
            </a>
          </ytd-thumbnail>
          <div id="details" class="style-scope ytd-rich-grid-media">
            <div id="meta" class="style-scope ytd-rich-grid-media">
              <h3 class="style-scope ytd-rich-grid-media">
                <a id="video-title" class="yt-simple-endpoint style-scope ytd-rich-grid-media" href="/watch?v=${video.id}">${video.title}</a>
              </h3>
              <div id="metadata-line" class="style-scope ytd-video-meta-block">
                <span class="style-scope ytd-video-meta-block">${video.channelTitle}</span>
              </div>
            </div>
          </div>
        </div>
      </ytd-rich-grid-media>
    </div>
  `;

  return videoItem;
}

function showSearchResults(results, query) {
  // Find the grid renderer
  const gridRenderer = document.querySelector("ytd-rich-grid-renderer");
  if (!gridRenderer) return;

  // Find the contents div within the grid renderer
  const contentsDiv = gridRenderer.querySelector("#contents");
  if (!contentsDiv) return;

  // Mark grid renderer as having search applied
  gridRenderer.setAttribute("ytd-search-applied", "true");

  // Show the home feed regardless of settings when search is applied
  gridRenderer.style.display = "";
  gridRenderer.classList.remove("youdifytube-hidden");

  // Clear existing content
  contentsDiv.innerHTML = "";

  // Add search title/header
  const header = document.createElement("div");
  header.className = "ydt-search-header";
  header.innerHTML = `
    <h2 style="font-size: 20px; margin: 16px 24px; color: #030303;">
      Search results for "${query}"
    </h2>
  `;
  contentsDiv.parentNode.insertBefore(header, contentsDiv);

  // Create row for grid items
  const row = document.createElement("ytd-rich-grid-row");
  row.className = "style-scope ytd-rich-grid-renderer";
  row.innerHTML =
    '<div id="contents" class="style-scope ytd-rich-grid-row"></div>';
  const rowContents = row.querySelector("#contents");

  // Add videos to the row
  results.forEach((video) => {
    const videoElement = createYouTubeVideoElement(video);
    rowContents.appendChild(videoElement);
  });

  // Add row to grid
  contentsDiv.appendChild(row);
}

function createSearchResultsContainer() {
  // Remove existing container if present
  const existingContainer = document.getElementById("ydt-search-results");
  if (existingContainer) existingContainer.remove();

  // Create new container
  const container = document.createElement("div");
  container.id = "ydt-search-results";
  container.className = "ydt-search-results";
  container.style.cssText = `
      margin: 20px auto;
      max-width: 1200px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    `;

  // Add title
  const title = document.createElement("h2");
  title.textContent = "Search Results";
  title.style.cssText = `
      font-size: 20px;
      margin-bottom: 16px;
      color: #030303;
    `;
  container.appendChild(title);

  // Add results grid
  const grid = document.createElement("div");
  grid.className = "ydt-results-grid";
  grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    `;
  container.appendChild(grid);

  // Find insertion point - try to insert before main content
  const insertPoint = document.querySelector("#primary");
  if (insertPoint && insertPoint.parentNode) {
    insertPoint.parentNode.insertBefore(container, insertPoint);
  } else {
    // Fallback - add to body
    document.body.appendChild(container);
  }

  return grid;
}

function renderSearchResults(results) {
  const grid = createSearchResultsContainer();

  results.forEach((video) => {
    const card = document.createElement("div");
    card.className = "ydt-video-card";
    card.style.cssText = `
        border-radius: 8px;
        overflow: hidden;
        background: white;
        cursor: pointer;
      `;

    card.innerHTML = `
        <img src="${video.thumbnail}" alt="${video.title}" style="width:100%; height:158px; object-fit:cover;">
        <div style="padding:12px;">
          <h3 style="margin:0 0 8px; font-size:14px; line-height:20px; max-height:40px; overflow:hidden;">${video.title}</h3>
          <p style="margin:0; font-size:12px; color:#606060;">${video.channelTitle}</p>
        </div>
      `;

    card.addEventListener("click", () => {
      window.location.href = `https://www.youtube.com/watch?v=${video.id}`;
    });

    grid.appendChild(card);
  });
  applySettings();
}

async function init() {
  currentSettings = await chrome.storage.local.get(null);

  // Clear search applied attribute when initializing
  const gridRenderer = document.querySelector("ytd-rich-grid-renderer");
  if (gridRenderer && gridRenderer.hasAttribute("ytd-search-applied")) {
    gridRenderer.removeAttribute("ytd-search-applied");
  }

  applySettings();
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class", "id"],
  });
}

function applySettings() {
  Object.entries(selectors).forEach(([feature, selectors]) => {
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (
          feature === "homeFeed" &&
          element.hasAttribute("ytd-search-applied")
        ) {
          // Don't hide homepage if search has been applied
          return;
        }
        element.style.display = currentSettings[feature] ? "none" : "";
        element.classList.toggle(
          "youdifytube-hidden",
          currentSettings[feature]
        );
      });
    });
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "UPDATE_SETTINGS") {
    chrome.storage.local.get(null).then((settings) => {
      currentSettings = settings;
      applySettings();
    });
  } else if (message.type === "SHOW_SEARCH_RESULTS") {
    showSearchResults(message.results, message.query);
  }
});

// Initialize with debounce
let initTimeout;
document.addEventListener("DOMContentLoaded", () => {
  clearTimeout(initTimeout);
  initTimeout = setTimeout(init, 300);
});
