'use strict';

import { clickableLogo, setToLoggedIn, logInOut } from "./utils/login-functions";
import { getRelativeTime } from "./utils/helper-functions";
import { createPost } from "./utils/post-functions";

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
                    upvote.style.background = `url('/assets/upvoted.png')`
                } else if(data.posts[i].vote == -1) {
                    downvote.style.background = `url('/assets/downvoted.png')`
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



