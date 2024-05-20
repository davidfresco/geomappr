import { registerEventListeners } from './listeners.js';
import { populateDropdowns } from './components/dropdowns.js';
import { getIconButton, getMapListItem } from './components/list-item.js';
import { getAccessToken, getUserInfo } from './google/authorize.js';
import { populateLoginInfo } from './components/google-login.js';

registerEventListeners();
populateDropdowns();

function loadContentScript() {
  browser.tabs.executeScript({
    file: "content_script.js",
  });
}

populateLoginInfo();

var list = document.getElementById('pinnedMapList');
list.appendChild(getMapListItem('framework item', 0));
