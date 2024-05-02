var local = browser.storage.local;

async function getMapList() {
    var maps = await local.get('__MAP_KEYS__');
    if (Object.keys(maps).length == 0) {
        await local.set({'__MAP_KEYS__': []});
        maps = [];
    } else {
        maps = maps['__MAP_KEYS__'];
    }
    return maps
}

function populateDropdowns() {
    var mapFileDropDowns = [
        document.getElementById('mapFileSelect'),
        document.getElementById('manageMapSelect')
    ];
    getMapList().then(mapList => {
        mapFileDropDowns.forEach(dropdown => {
            for (var child of dropdown.querySelectorAll('*')) {
                if (!child.hasAttribute('default')) {
                    dropdown.removeChild(child);
                }
            }
            mapList.forEach(elem => {
                var option = document.createElement('option');
                option.innerText = elem;
                option.setAttribute('value', elem);
                dropdown.appendChild(option);
            });
        });
    });
    local.get('__LAST_MAP__').then(value => {
        var lastMap = value['__LAST_MAP__'];
        if (lastMap) {
            document.getElementById('mapFileSelect').value = lastMap;
        } else {
            document.getElementById('mapFileSelect').value = '';
        }
    });
}

async function addMap(name) {
    var maps = await getMapList();
    if (!maps.includes(name)) {
        maps.push(name);
        await local.set({'__MAP_KEYS__': maps});
        var mapData = {};
        mapData[name] = [];
        await local.set(mapData);
    }
}

async function delMap(name) {
    var maps = await getMapList();
    var index = maps.indexOf(name);
    if (index < 0) return;
    maps.splice(index, 1);
    await local.set({'__MAP_KEYS__': maps});
    await local.remove(name);
    var lastMapResult = await local.get('__LAST_MAP__')
    if (lastMapResult['__LAST_MAP__'] === name) {
        await local.remove('__LAST_MAP__');
    }
}

document.getElementById('createMapButton').addEventListener("click", event => {
    var mapName = document.getElementById('createMapField').value;
    if (!mapName) {
        showToast(badToast, 'Enter a map name');
        return;
    }
    addMap(mapName).then(() => {
        populateDropdowns();
    });
});

document.getElementById('deleteMapButton').addEventListener("click", event => {
    var mapName = document.getElementById('manageMapSelect').value;
    if (!mapName) {
        showToast(badToast, 'Select a map to delete');
        return;
    }
    delMap(mapName).then(() => {
        populateDropdowns();
    });
});

function showToast(toastElem, msg) {
    toastElem.querySelector('.toast-body').innerHTML = msg;
    toastElem.removeAttribute('hidden');
    bootstrap.Toast.getOrCreateInstance(toastElem).show();
}

document.getElementById('saveToMapButton').addEventListener("click", event => {
    var mapName = document.getElementById('mapFileSelect').value;
    if (!mapName) {
        showToast(badToast, 'No map is selected to save to');
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
            showToast(badToast, 'Could not find Geoguessr game in the current tab');
        });
    }).then(() => {
        var lastMapData = {}
        lastMapData['__LAST_MAP__'] = mapName;
        local.set(lastMapData).then(() => {
        });
    });
});

document.getElementById('downloadMapButton').addEventListener("click", event => {
    var mapName = document.getElementById('manageMapSelect').value;
    if (!mapName) {
        showToast(badToast, 'Select a map to download');
        return;
    }
    getMapList().then((maps) => {
        if (!maps.includes(name)) {
        }
    });
    local.get(mapName).then((mapData) => {
        text = JSON.stringify(mapData[mapName]);
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

populateDropdowns();
const goodToast = document.getElementById('goodToast');
const badToast = document.getElementById('badToast');

function loadContentScript() {
  browser.tabs.executeScript({
    file: "content_script.js",
  });
}

browser.runtime.onMessage.addListener((payload) => {
    var mapName = payload.meta.mapID;
    if (payload.cmd === 'getPosition' && payload.response) {
        browser.storage.local.get(mapName).then((value) => {
            var map = value[mapName];
            map.push(payload.response);
            var mapData = {};
            mapData[mapName] = map;
            browser.storage.local.set(mapData).then(() => {
                showToast(goodToast, `Saved current location to ${mapName}`);
            });
        });
    }
});
