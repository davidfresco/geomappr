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
    getMapList()
    .then(mapList => {
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
    if (index > -1) {
        maps.splice(index, 1);
        await local.set({'__MAP_KEYS__': maps});
        await local.remove(name);
    }
}

document.getElementById('createMapButton').addEventListener("click", event => {
    var mapName = document.getElementById('createMapField').value;
    addMap(mapName)
    .then(() => {
        populateDropdowns();
    });
});

document.getElementById('deleteMapButton').addEventListener("click", event => {
    var mapName = document.getElementById('manageMapSelect').value;
    delMap(mapName)
    .then(() => {
        populateDropdowns();
    });
});

document.getElementById('saveToMapButton').addEventListener("click", event => {
    var mapName = document.getElementById('mapFileSelect').value;
    if (!mapName) return;
    console.log(`saving to ${mapName}`);

    curPosPromise = browser.tabs.query({active: true, currentWindow: true})
    .then(tabs => {
        var tabID = tabs[0].id;
        var payload = {
            cmd: 'getPosition',
            meta: {
                saveToMap: true,
                mapID: mapName
            }
        }
        browser.tabs.sendMessage(tabID, payload);
    });
});

document.getElementById('downloadMapButton').addEventListener("click", event => {
    var mapName = document.getElementById('manageMapSelect').value;
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
