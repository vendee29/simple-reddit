'use strict';

let loggedUser = localStorage.getItem('username') ? localStorage.getItem('username') : null;
console.log('Logged User: ' + loggedUser)

/////////////// Clickable logo, takes to homepage ////////////////

clickableLogo();

//////////////  Setting the user container to logged in ////////////

setToLoggedIn();

////////////// Log In / Log Out button //////////////////////

logInOut();

/////////////// Fetching the posts ///////////////////////

fetchOrdered();

///////////////// Fetching the posts - ORDERED /////////////

sort();

////////////////// Used functions /////////////////////

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

function createPost() { // creates basic structure of a post
    let postsMain = document.querySelector('.content main');
    let article = document.createElement('article');
    article.classList.add('post-article');

    let divForContent = document.createElement('div');
    let ownerAndDate = document.createElement('div');
    let title = document.createElement('h3');
    let website = document.createElement('a');

    let divForLinks = document.createElement('div');
    let modify = document.createElement('button');
    let remove = document.createElement('button');

    let divForVote = document.createElement('div');
    let vote = document.createElement('div');
    let upvote = document.createElement('div');
    let downvote = document.createElement('div');

    upvote.classList.add('upvote');
    downvote.classList.add('downvote');

    divForContent.classList.add('post-content');
    divForVote.classList.add('vote');
    vote.classList.add('vote-value');
    divForLinks.classList.add('links');

    ownerAndDate.classList.add('owner-date');
    website.classList.add('website')
    modify.classList.add('modify');
    remove.classList.add('remove');

    modify.textContent = `Modify`;
    remove.textContent = `Remove`;

    divForLinks.appendChild(modify);
    divForLinks.appendChild(remove);

    divForContent.appendChild(ownerAndDate);
    divForContent.appendChild(title);
    divForContent.appendChild(website);
    divForContent.appendChild(divForLinks);

    divForVote.appendChild(upvote);
    divForVote.appendChild(vote);
    divForVote.appendChild(downvote);

    article.appendChild(divForVote)
    article.appendChild(divForContent);
    
    postsMain.appendChild(article);
}

function getRelativeTime(oldTimestamp) { // gets relative time from a timestamp :)
    let date = new Date();
    let timestamp = date.getTime();
    let seconds = Math.floor(timestamp / 1000);
    oldTimestamp = Math.floor(oldTimestamp / 1000);
    let difference = seconds - oldTimestamp;
    let output = ``;
    if (difference < 60) {
    // Less than a minute has passed:
    output = `${difference} seconds ago`;
    } else if (difference < 3600) {
    // Less than an hour has passed:
    output = `${Math.floor(difference / 60)} minutes ago`;
    } else if (difference < 86400) {
    // Less than a day has passed:
    output = `${Math.floor(difference / 3600)} hours ago`;
    } else if (difference < 2620800) {
    // Less than a month has passed:
    output = `${Math.floor(difference / 86400)} days ago`;
    } else if (difference < 31449600) {
    // Less than a year has passed:
    output = `${Math.floor(difference / 2620800)} months ago`;
    } else {
    // More than a year has passed:
    output = `${Math.floor(difference / 31449600)} years ago`;
    }
    return output;
}

function fetchPosts(url) { // gets all the posts and sets all the functions, incl. voting, modifying and removing

    fetch(url, {
        method: 'GET',
        headers: {
            'username': localStorage.getItem('username')
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log('Current number of posts: ' + data.posts.length);
            for(let i = 0; i < data.posts.length; i++) {
                createPost();
                let voteValue = document.querySelectorAll('.vote-value')[i];
                let ownerDate = document.querySelectorAll('.owner-date')[i];
                let postTitle = document.querySelectorAll('.post-content h3')[i];
                let websiteUrl = document.querySelectorAll('.website')[i];
                let updatePost = document.querySelectorAll('.modify')[i];
                let deletePost = document.querySelectorAll('.remove')[i];
                // let date = new Date(parseInt(data.posts[i].timestamp))
                
                ownerDate.textContent = `Posted by ${data.posts[i].owner ? data.posts[i].owner : 'anonymous'} ${getRelativeTime(data.posts[i].timestamp)}`
                postTitle.textContent = data.posts[i].title;
                websiteUrl.textContent = data.posts[i].url;
                websiteUrl.setAttribute('href', data.posts[i].url);
                voteValue.textContent = data.posts[i].score ? data.posts[i].score : 0;

                let upvote = document.querySelectorAll('.upvote')[i];
                let downvote = document.querySelectorAll('.downvote')[i];

                /////////////// Disabling 'Remove' button //////////////////////

                if(!localStorage.getItem('username') && data.posts[i].owner != null) {
                    deletePost.setAttribute('disabled', true)
                } else if(loggedUser !== data.posts[i].owner && data.posts[i].owner != null) {
                    deletePost.setAttribute('disabled', true)
                }

                /////////////// Disabling 'Modify' button //////////////////////

                if(!localStorage.getItem('username') && data.posts[i].owner != null) {
                    updatePost.setAttribute('disabled', true)
                } else if(loggedUser !== data.posts[i].owner && data.posts[i].owner != null) {
                    updatePost.setAttribute('disabled', true)
                }

                /////////////// Setting the upvoted/downvoted icons //////////////////////

                if(data.posts[i].vote == 1) {
                    upvote.style.background = `url('../assets/upvoted.png')`
                } else if(data.posts[i].vote == -1) {
                    downvote.style.background = `url('../assets/downvoted.png')`
                }

                //////////////////// Upvoting a post //////////////////////////////////

                upvote.addEventListener('click', () => {
                    console.log(data.posts[i].id)
                    fetch(`http://localhost:3000/posts/${data.posts[i].id}/upvote`, {
                        method: 'PUT',
                        headers: {
                            'username': localStorage.getItem('username')
                        }
                    })
                        .then(res => res.json())
                        .then(upData => {
                            console.log(upData);
                            if(upData.message) {
                                alert('You must log in to vote!');
                                return;
                            }
                            location.reload();
                        })
                        .catch(err => {
                            console.log(err)
                        })   
                })

                //////////////////// Downvoting a post //////////////////////////////////

                downvote.addEventListener('click', () => {
                    console.log(data.posts[i].id)
                    fetch(`http://localhost:3000/posts/${data.posts[i].id}/downvote`, {
                        method: 'PUT',
                        headers: {
                            'username': localStorage.getItem('username')
                        }
                    })
                        .then(res => res.json())
                        .then(downData => {
                            console.log(downData);
                            if(downData.message) {
                                alert('You must log in to vote!');
                                return;
                            }
                            location.reload();
                        })
                        .catch(err => {
                            console.log(err)
                        })   
                })

                //////////////////// Removing a post //////////////////////////////////

                deletePost.addEventListener('click', () => {
                    console.log(data.posts[i].id)
                    fetch(`http://localhost:3000/posts/${data.posts[i].id}`, {
                        method: 'DELETE',
                        headers: {
                            'username': localStorage.getItem('username')
                        }
                    })
                        .then(res => res.json())
                        .then(delData => {
                            if(delData.message) {
                                alert('You are not authorized to delete this post!')
                                return;
                            } else {
                                alert(`The post '${data.posts[i].title}' was deleted.`)
                            }
                            location.reload();
                        })
                        .catch(err => {
                            console.log(err)
                        })   
                })

                /////////////////// Modifying a post ///////////////////////////////////

                updatePost.addEventListener('click', () => {
                    window.location.href = `http://localhost:3000/edit_post?id=${data.posts[i].id}`;
                })

                
            }})
        .catch(err => {
            console.log(err)
            })
}

function fetchOrdered() { // gets the posts based on the selected sorting
    if(document.querySelector('.sort')) {

        let mostLiked = document.querySelector('.liked');
        let oldest = document.querySelector('.oldest');
        let newest = document.querySelector('.newest');

        let postsMain = document.querySelector('.content main');
        
        if(oldest.classList.contains('sorted')) {
            postsMain.textContent = '';
            fetchPosts('http://localhost:3000/posts')
        } else if(mostLiked.classList.contains('sorted')) {
            postsMain.textContent = '';
            fetchPosts('http://localhost:3000/posts_ordered')
        } else if(newest.classList.contains('sorted')) {
            postsMain.textContent = '';
            fetchPosts('http://localhost:3000/posts_newest')
        }
    }
}

function sort() { // handles the sorting buttons
    let sortBtns = document.querySelectorAll('.sort button');
    
    for(let i = 0; i < sortBtns.length; i++) {
        sortBtns[i].addEventListener('click', () => {
            for(let j = 0; j < sortBtns.length; j++) {
                if(sortBtns[j].classList.contains('sorted')) {
                    sortBtns[j].classList.remove('sorted');
                    sortBtns[j].classList.add('not-sorted');
                }
            }
            sortBtns[i].classList.remove('not-sorted');
            sortBtns[i].classList.add('sorted');
            fetchOrdered();
        })    
    }
}

export function fetchWithoutUsername(url, method, values) { // sends request when no username is available
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        window.location.href = 'http://localhost:3000/main';
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

export function fetchWithUsername(url, method, values) { // sends request when a username is available
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'username': localStorage.getItem('username')
        },
        body: JSON.stringify(values)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        window.location.href = 'http://localhost:3000/main';
    })
    .catch(error => {
        console.error('Error:', error);
    });
}