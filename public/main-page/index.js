"use strict";

import {
  clickableLogo,
  setToLoggedIn,
  logInOut,
} from "../utils/login-functions.mjs";
import fetchPosts from "../utils/main-fetch-function.mjs";

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

function fetchOrdered() {
  // gets the posts based on the selected sorting
  if (document.querySelector(".sort")) {
    let mostLiked = document.querySelector(".liked");
    let oldest = document.querySelector(".oldest");
    let newest = document.querySelector(".newest");

    let postsMain = document.querySelector(".content main");

    if (oldest.classList.contains("sorted")) {
      postsMain.textContent = "";
      fetchPosts("http://localhost:3000/posts");
    } else if (mostLiked.classList.contains("sorted")) {
      postsMain.textContent = "";
      fetchPosts("http://localhost:3000/posts_ordered");
    } else if (newest.classList.contains("sorted")) {
      postsMain.textContent = "";
      fetchPosts("http://localhost:3000/posts_newest");
    }
  }
}

function sort() {
  // handles the sorting buttons
  let sortBtns = document.querySelectorAll(".sort button");

  for (let i = 0; i < sortBtns.length; i++) {
    sortBtns[i].addEventListener("click", () => {
      for (let j = 0; j < sortBtns.length; j++) {
        if (sortBtns[j].classList.contains("sorted")) {
          sortBtns[j].classList.remove("sorted");
          sortBtns[j].classList.add("not-sorted");
        }
      }
      sortBtns[i].classList.remove("not-sorted");
      sortBtns[i].classList.add("sorted");
      fetchOrdered();
    });
  }
}
