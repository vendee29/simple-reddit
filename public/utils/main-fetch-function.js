'use strict';

import { createPost } from "./post-functions";
import { getRelativeTime } from "./helper-functions";

export default function fetchPosts(url) { // gets all the posts and sets all the functions, incl. voting, modifying and removing

    fetch(url, {
        method: 'GET',
        headers: {
            'username': localStorage.getItem('username')
            }
        })
        .then(res => res.json())
        .then(data => {
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
                    fetch(`http://localhost:3000/posts/${data.posts[i].id}/upvote`, {
                        method: 'PUT',
                        headers: {
                            'username': localStorage.getItem('username')
                        }
                    })
                        .then(res => res.json())
                        .then(upData => {
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
                    fetch(`http://localhost:3000/posts/${data.posts[i].id}/downvote`, {
                        method: 'PUT',
                        headers: {
                            'username': localStorage.getItem('username')
                        }
                    })
                        .then(res => res.json())
                        .then(downData => {
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
                    window.location.assign(`http://localhost:3000/edit_post?id=${data.posts[i].id}`);
                })
            }})
        .catch(err => {
            console.log(err)
            })
}