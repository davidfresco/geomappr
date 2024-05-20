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

async function getLastMap() {
    var result = await local.get('__LAST_MAP__');
    var lastMaps = result['__LAST_MAP__'];
    return lastMaps ?? '';
}

async function setLastMap(mapName) {
    var lastMapData = {}
    lastMapData['__LAST_MAP__'] = mapName;
    await local.set(lastMapData)
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

async function getMapData(mapName) {
    var mapData = await local.get(mapName);
    return mapData['mapName'] ?? [];
}

async function setMapData(mapName, newLocation) {
    var mapData = await getMapData(mapName);
    mapData.push(newLocation);
    var newMapData = {};
    newMapData[mapName] = mapData;
    return await local.set(newMapData);
}

async function getGoogleToken() {
    const token = await local.get('__OAUTH2_TOKEN__');
    return token['__OAUTH2_TOKEN__'];
}

async function setGoogleToken(token) {
    const tokenData = {};
    tokenData['__OAUTH2_TOKEN__'] = token;
    return await local.set(tokenData);
}

export { getMapList, getLastMap, setLastMap, addMap, delMap, getMapData, setMapData, getGoogleToken, setGoogleToken };
