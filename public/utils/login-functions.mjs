'use strict';

export function clickableLogo() { // click on the logo takes the user to the homepage
    let logo = document.querySelector('#logo img');
    logo.addEventListener('click', () => {
    window.location.href = 'http://localhost:3000/main';
    })
}

export function setToLoggedIn() { // checks if any user is logged in; if so layout is changed accordingly
    let loginBtn = document.querySelector('.login');
    let avatar = document.querySelector('.user-container img');
    let username = document.querySelector('.username');

    if(localStorage.getItem('username')) {
        loginBtn.textContent = 'Log Out';
        avatar.setAttribute('src', '../assets/avatar.png');
        username.textContent = localStorage.getItem('username');
        fetchVoteCount();
    }
}

export function fetchVoteCount() { // gets the user vote count and sets it in the header
    let userVoteCount = document.querySelector('.vote-count');

    fetch(`http://localhost:3000/users/${localStorage.getItem('username')}`)
        .then(res => res.json())
        .then(data => {
            userVoteCount.textContent = data[0].voteCount + ' votes';
        })
        .catch(err => {
            console.log(err)
            })  
}

export function logInOut() { // handles the Log In / Log Out button
    if(document.querySelector('.login')) {

        let loginBtn = document.querySelector('.login');
        loginBtn.addEventListener('click', () => {
            console.log('clicked')
            if(loginBtn.textContent == 'Log In') {
                window.location.assign('http://localhost:3000/login');
            } else {
                logOut();
    
                // location.reload();
            }
        })
    }
}

export function logOut() { // logs user out, handles the layout
    let loginBtn = document.querySelector('.login');
    let avatar = document.querySelector('.user-container img');
    let username = document.querySelector('.username');
    let voteCount = document.querySelector('.vote-count');

    localStorage.clear();
        alert('You have been logged out.');
        loginBtn.textContent = 'Log In';
        username.textContent = '';
        voteCount.textContent = '';
        avatar.setAttribute('src', '../assets/avatar1.png')
}

