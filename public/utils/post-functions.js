'use strict';

export function createPost() { // creates basic structure of a post
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