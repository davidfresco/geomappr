function showToast(toastElemId, msg) {
    var toastElem = document.getElementById(toastElemId);
    toastElem.querySelector('.toast-body').innerHTML = msg;
    toastElem.removeAttribute('hidden');
    bootstrap.Toast.getOrCreateInstance(toastElem).show();
}

export { showToast };
