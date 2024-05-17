import { showToast } from './components/toasts.js';
import { populateDropdowns } from './components/dropdowns.js';
import { getMapList, getLastMap, setLastMap, addMap, delMap, getMapData, setMapData } from './storage.js';

function registerEventListeners() {
    document.getElementById('createMapButton').addEventListener("click", event => {
        var mapName = document.getElementById('createMapField').value;
        if (!mapName) {
            showToast('badToast', 'Enter a map name');
            return;
        }
        addMap(mapName).then(() => {
            populateDropdowns();
        });
        console.log('created map!');
    });

    document.getElementById('deleteMapButton').addEventListener("click", event => {
        var mapName = document.getElementById('manageMapSelect').value;
        if (!mapName) {
            showToast('badToast', 'Select a map to delete');
            return;
        }
        delMap(mapName).then(() => {
            populateDropdowns();
        });
    });

    document.getElementById('saveToMapButton').addEventListener("click", event => {
        var mapName = document.getElementById('mapFileSelect').value;
        if (!mapName) {
            showToast('badToast', 'No map is selected to save to');
            return;
        }

        browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
            var tabID = tabs[0].id;
            var payload = {
                cmd: 'getPosition',
                meta: {
                    saveToMap: true,
                    mapID: mapName
                }
            }
            browser.tabs.sendMessage(tabID, payload).catch(error => {
                showToast('badToast', 'Could not find Geoguessr game in the current tab');
            });
        }).then(() => {
            setLastMap(mapName);
        });
    });

    document.getElementById('downloadMapButton').addEventListener("click", event => {
        var mapName = document.getElementById('manageMapSelect').value;
        if (!mapName) {
            showToast('badToast', 'Select a map to download');
            return;
        }
        getMapList().then((maps) => {
            if (!maps.includes(name)) {
            }
        });
        getMapData().then((mapData) => {
            text = JSON.stringify(mapData);
            filename = mapName.replace(' ', '_') + '.json';
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        });
    });

    browser.runtime.onMessage.addListener((payload) => {
        var mapName = payload.meta.mapID;
        if (payload.cmd === 'getPosition' && payload.response) {
            setMapData(mapName, payload.response).then(() => {
                showToast('goodToast', `Saved current location to ${mapName}`);
            });
        }
    });
};

export { registerEventListeners };
