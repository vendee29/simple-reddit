'use strict';

import { clickableLogo, setToLoggedIn, logInOut } from "../utils/login-functions.mjs";
import { fetchWithUsername, fetchWithoutUsername } from "../utils/fetch-functions.mjs";

clickableLogo();
setToLoggedIn();
logInOut();

let postForm = document.querySelector('.post-form');

///////////////// Collecting data from the post form ////////////////////////

postForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let values = {
        title: postForm.title.value,
        url: postForm.url.value
    }

    if(!localStorage.getItem('username')) {
        fetchWithoutUsername('http://localhost:3000/posts', 'POST', values)
    } else {
        fetchWithUsername('http://localhost:3000/posts','POST', values)
}})