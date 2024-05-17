import { registerEventListeners } from './listeners.js';
import { populateDropdowns } from './components/dropdowns.js';
import { getIconButton, getMapListItem } from './components/list-item.js';
import { getAccessToken } from './google/authorize.js';

registerEventListeners();
populateDropdowns();

function loadContentScript() {
  browser.tabs.executeScript({
    file: "content_script.js",
  });
}

var list = document.getElementById('pinnedMapList');
list.appendChild(getMapListItem('framework item', 0));
console.log(getAccessToken());
