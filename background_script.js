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
            browser.storage.local.set(mapData);
        });
    }
});

