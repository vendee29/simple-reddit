'use strict';

import { clickableLogo } from '../../../reddit/public/index.js';

const loginForm = document.querySelector('.login-form');

///////////////// Collecting data from the Login form ///////////////////

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let values = {
        username: loginForm.username.value,
    }
    
    fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data.username);
        localStorage.setItem('username', data.username);
        window.location.assign('http://localhost:3000/space');
    })
    .catch(error => {
        console.error('Error:', error);
    });
})
