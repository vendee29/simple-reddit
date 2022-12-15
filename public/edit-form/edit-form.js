'use strict';

import { clickableLogo, setToLoggedIn, logInOut, fetchWithUsername} from '../../../reddit/public/index.js';

let editForm = document.querySelector('.edit-form');

//////////////// Pre-filling the data of the edited post ///////////////////////

prefillInput();

function prefillInput() {
    
    let titleInput = document.querySelector('#title');
    let urlInput = document.querySelector('#url');
    const urlParams = new URLSearchParams(location.search);
    const idNumber = 0;
    for (const [key, value] of urlParams) {
        idNumber = value;
    }
    // let idNumber = window.location.href.split('=')[1];

    fetch(`http://localhost:3000/posts/${idNumber}`)
        .then(response => response.json())
        .then(data => {
            titleInput.setAttribute('value', `${data[0].title}`)
            urlInput.setAttribute('value', `${data[0].url}`)
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
///////////////// Collecting data from the Edit form //////////////////

editForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let values = {
        title: editForm.title.value,
        url: editForm.url.value
    }

    fetchWithUsername(`http://localhost:3000/posts/${idNumber}`, 'PUT', values)
})
    