import { getMapList, getLastMap } from '../storage.js';

async function populateDropdowns() {
    var local = browser.storage.local;
    var mapFileDropDowns = [
        document.getElementById('mapFileSelect'),
        document.getElementById('manageMapSelect')
    ];

    var mapList = await getMapList();
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
    var lastMap = await getLastMap();
    document.getElementById('mapFileSelect').value = lastMap;
}

export { populateDropdowns };
