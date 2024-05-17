
function getIconButton(iconName) {
    var elem = document.createElement('span');
    elem.classList.add('material-icons-outlined');
    elem.classList.add('location-list-action');
    elem.classList.add('clickable-span');
    elem.textContent = iconName;
    return elem;
}

function getMapListItem(name, value) {
    var elem = document.createElement('li');
    elem.classList.add('list-group-item');
    var textSpan = document.createElement('span');
    textSpan.textContent = name;
    elem.appendChild(textSpan);
    elem.appendChild(getIconButton('push_pin'));
    elem.appendChild(getIconButton('undo'));
    return elem;
}

export { getIconButton, getMapListItem };
