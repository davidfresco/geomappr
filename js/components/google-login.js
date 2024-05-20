import { getGoogleToken } from '../storage.js';
import { getAccessToken, getUserInfo } from '../google/authorize.js';

async function populateLoginInfo() {
    const token = await getGoogleToken();
    if (token) {
        const info = await getUserInfo(token);
        console.log(info);
        const profilePicElem = document.getElementById('googleProfilePic');
        console.log(info['picture']);
        profilePicElem.setAttribute('src', info['picture']);
    }
}

export { populateLoginInfo };
