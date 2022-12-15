CREATE DATABASE reddit;
USE reddit;
CREATE TABLE posts (
	id INT AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR(255),
    url VARCHAR(255),
    timestamp VARCHAR(255),
    owner VARCHAR(255)
    );

CREATE TABLE users (
	user_id INT AUTO_INCREMENT PRIMARY KEY,
	username VARCHAR(255)
    );

CREATE TABLE votes (
	vote_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255)
	post_id INT,
    vote INT,
    );