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
    if (!mapName) return;
    addMap(mapName).then(() => {
        populateDropdowns();
    });
});

document.getElementById('deleteMapButton').addEventListener("click", event => {
    var mapName = document.getElementById('manageMapSelect').value;
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
    if (!mapName) return;

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
            var toastElem = document.getElementById('badToast');
            toastElem.querySelector('.toast-body').innerHTML = 'Could not find Geoguessr game in the current tab';
            toastElem.removeAttribute('hidden');
            bootstrap.Toast.getOrCreateInstance(toastElem).show();
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

function loadContentScript() {
  browser.tabs.executeScript({
    file: "content_script.js",
  });
}

browser.runtime.onMessage.addListener((payload) => {
    console.log("got response:");
    console.log(payload);
    var mapName = payload.meta.mapID;
    if (payload.cmd === 'getPosition' && payload.response) {
        browser.storage.local.get(mapName).then((value) => {
            console.log(value);
            var map = value[mapName];
            console.log(map);
            map.push(payload.response);
            console.log(map);
            var mapData = {};
            mapData[mapName] = map;
            browser.storage.local.set(mapData).then(() => {
                var toastElem = document.getElementById('goodToast')
                toastElem.querySelector('.toast-body').innerHTML = `Saved current location to ${mapName}`;
                toastElem.removeAttribute('hidden');
                bootstrap.Toast.getOrCreateInstance(toastElem).show();
            });
        });
    }
});
