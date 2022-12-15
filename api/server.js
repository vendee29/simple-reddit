'use strict';

const mysql = require('mysql');
const express = require('express');
const app = express();

module.exports = app;

app.use(express.json());
app.use(express.static('public'));

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'reddit',
    multipleStatements: true
});

conn.connect((err) => { // establishing a connection with the database
    if(err) {
		console.log(err, `The database connection couldn't be established`);
		return;
	} else {
		console.log(`Connection established`);
	}
})

/////////////////// SQL PROMISE FUNCTION ////////////////////////

function queryDb(sqlQuery, valuesArr) { // return?
    return new Promise((resolve, reject) => {
        conn.query(sqlQuery, valuesArr, (err, rows) => {
            if(err) {
                reject('DATABASE ERROR!')
                return;
            }
            return resolve(rows)
        })
    })
}
//  GET all posts

app.get('/posts', (req, res) => {
    let queryNoUsername = `SELECT id, title, url, timestamp, SUM(vote) AS score, owner FROM posts LEFT JOIN votes ON id = post_id
    GROUP BY id;`
    let queryIfUsername = `SELECT id, title, url, timestamp, SUM(v1.vote) AS score, owner, v2.vote FROM posts LEFT JOIN votes v1 ON id = v1.post_id LEFT JOIN votes v2 ON id = v2.post_id AND v2.username = ?
    GROUP BY id;`

    let query = req.headers.username ? queryIfUsername : queryNoUsername;
    let values = req.headers.username ? [req.headers.username] : null;

    queryDb(query, values)
    .then(rows => 
        res.status(200).json({
            'posts': rows
        }))
    .catch(err => console.log(err))
})

// GET a single post

app.get('/posts/:id', (req, res) => {
    let postId = req.params.id;
    let queryNoUsername = `SELECT id, title, url, timestamp, SUM(vote) AS score, owner FROM posts LEFT JOIN votes ON id = post_id WHERE id = ?
    GROUP BY id;`
    let queryIfUsername = `SELECT id, title, url, timestamp, SUM(v1.vote) AS score, owner, v2.vote FROM posts LEFT JOIN votes v1 ON id = v1.post_id LEFT JOIN votes v2 ON id = v2.post_id AND v2.username = ? WHERE id = ?
    GROUP BY id;`
    let query = req.headers.username ? queryIfUsername : queryNoUsername;
    let values = req.headers.username ? [req.headers.username, postId] : [postId];
    
    queryDb(query, values)
    .then(rows => {
        res.status(200).json(rows)
    })
    .catch(err => console.log(err))
    }
)

// POST a new post

app.post('/posts', (req, res) => {
    let timestamp = Date.now().toString();
    let owner = req.headers.username ? req.headers.username : null;
    let query = 'INSERT INTO posts (title, url, timestamp, owner) VALUES (?, ?, ?, ?);'

    queryDb(query, [req.body.title, req.body.url, timestamp, owner])
    .then(rows => {
        console.log(`Post added with the id ${rows.insertId}`);
        res.status(201).json({
            "id": rows.insertId,
            "title": req.body.title,
            "url": req.body.url,
            "timestamp": timestamp,
            "score": 0,
            "owner": owner
        })
    })
    .catch(err => console.log(err))
})

// PUT VOTING

async function voteAsync(username, postId, vote) {

    let finalQuery = `SELECT * FROM votes WHERE username = ? AND post_id = ?`;
    let result = await queryDb(finalQuery, [username, postId]);
    let prefix = (vote == 1) ? 'up' : 'down';

    if(result.length == 0) {
        await queryDb(`INSERT INTO votes (username, post_id, vote) VALUES (?, ?, ?)`, [username, postId, vote])
        console.log(`The post with id ${postId} was ${prefix}voted.`);
        return queryDb(`SELECT id, title, url, timestamp, SUM(vote) AS score, owner, vote FROM posts LEFT JOIN votes ON id = post_id WHERE id = ?;`, [postId]) 

    } else if(result[0].vote == (-vote)) {
        await queryDb(`UPDATE votes SET vote = ? WHERE username = ? AND post_id = ?`, [vote, username, postId])
        console.log(`The vote for user ${username} and post_id ${postId} was changed.`);
        return queryDb(`SELECT id, title, url, timestamp, SUM(vote) AS score, owner, vote FROM posts LEFT JOIN votes ON id = post_id WHERE id = ?;`, [postId])

    } else if(result[0].vote == vote) {
        await queryDb(`DELETE FROM votes WHERE username = ? AND post_id = ?`, [username, postId])
        console.log(`The ${prefix}vote from the post with the id ${postId} was removed.`);
        return queryDb(`SELECT id, title, url, timestamp, SUM(vote) AS score, owner, vote FROM posts LEFT JOIN votes ON id = post_id WHERE id = ?;`, [postId])             
    }
}

app.put('/posts/:id/upvote', (req, res) => { // after removing the vote, it still returns the vote value 1
    let postId = req.params.id;
    let username = req.headers.username;

    if(req.headers.username !== 'null' && req.headers.username !== undefined) {
        voteAsync(username, postId, 1)
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => console.log(err))

    } else {
        console.log(`The post with the id ${postId} was not upvoted.`);
        res.status(200).json({
            'message': `Username missing. The post was not upvoted.`
        })
    }
 })

app.put('/posts/:id/downvote', (req, res) => {
    let postId = req.params.id;
    let username = req.headers.username;

    if(req.headers.username !== 'null' && req.headers.username !== undefined) {
        voteAsync(username, postId, -1)
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => console.log(err))

    } else {
        console.log(`The post with the id ${postId} was not downvoted.`);
        res.status(200).json({
            'message': `Username missing. The post was not downvoted.`
        })
    }
 })

// DELETE a post

async function deleteWithoutUsername(postId) {
    let result = await queryDb(`SELECT * FROM posts WHERE id = ?`, [postId]);
    
    if(result[0].owner == null) {
        await queryDb(`DELETE FROM votes WHERE post_id = ?; DELETE FROM posts WHERE id = ?`, [postId, postId])
        console.log(`The post with the id ${postId} was deleted.`)
        return result;
    } else {
        console.log(`The post with the id ${postId} was not deleted. No username. Has owner.`);
        return {
            'message': `You are not authorized to delete this post! Only the owner can delete this post.`
        };
    }
}

async function deleteWithUsername(postId, owner) {
    let result = await queryDb(`SELECT id, title, url, timestamp, owner FROM posts WHERE id = ? AND (owner IS NULL OR owner = ?)`, [postId, owner])

    if(result.length == 0) {
        console.log(`The post with the id ${postId} was not deleted.`);
        return {
            'message': `You are not authorized to delete this post!`
        }
    } else {
        queryDb(`DELETE FROM votes WHERE post_id = ?; DELETE FROM posts WHERE id = ? AND (owner IS NULL OR owner = ?);`, [postId, postId, owner])
        console.log(`The post with the id ${postId} was deleted.`);
        return result;
    }
}

function deletePost(postId, owner) {
    if(!owner) {
        return deleteWithoutUsername(postId)
    }
    return deleteWithUsername(postId, owner)
}

app.delete('/posts/:id', (req, res) => {
    let postId = req.params.id;
    let owner = req.headers.username;


    deletePost(postId, owner)
    .then(result => {
        res.status(200).json(result);
        })
    .catch(err => console.log(err))
})

// PUT update a post

async function updateWithUsername(title, url, timestamp, postId, owner) {
    let result = await queryDb(`SELECT id, title, url, timestamp, SUM(vote) AS score, owner, vote FROM posts LEFT JOIN votes ON id = post_id
    WHERE id = ? AND (owner = ? OR owner IS NULL)`, [postId, owner])

    if(result[0].id === null) {
        console.log(`The post with the id ${postId} was not updated.`);
        return {
            'message': `You are not authorized to update this post!`
        }
    }
    await queryDb(`UPDATE posts SET title = ?, url = ?, timestamp = ? WHERE id = ? AND (owner = ? OR owner IS NULL)`, [title, url, timestamp, postId, owner]);
    console.log(`The post with the id ${postId} was updated.`);

    let finalResult = await queryDb(`SELECT id, title, url, timestamp, SUM(vote) AS score, owner, vote FROM posts LEFT JOIN votes ON id = post_id
    WHERE id = ?`, [postId])

    return finalResult;
}

async function updateWithoutUsername(title, url, timestamp, postId) {
    let result = await queryDb(`SELECT id, title, url, timestamp, SUM(vote) AS score, owner FROM posts LEFT JOIN votes ON id = post_id
    WHERE id = ? AND owner IS NULL`, [postId])

    if(result[0].id == null) {
        console.log(`The post with the id ${postId} was not updated.`);
        return {
            'message': `You are not authorized to update this post!`
        }
    }
    await queryDb(`UPDATE posts SET title = ?, url = ?, timestamp = ? WHERE id = ?`, [title, url, timestamp, postId]);
    console.log(`The post with the id ${postId} was updated. Owner is anonymous`);
    
    let finalResult = await queryDb(`SELECT id, title, url, timestamp, SUM(vote) AS score, owner FROM posts LEFT JOIN votes ON id = post_id
    WHERE id = ?`, [postId])
    
    return finalResult;
}

function updatePost(title, url, timestamp, postId, owner) {
    if(owner == null) {
        return updateWithoutUsername(title, url, timestamp, postId);
    }
    return updateWithUsername(title, url, timestamp, postId, owner)
}

app.put('/posts/:id', (req, res) => {
    let postId = req.params.id;
    let owner = req.headers.username ? req.headers.username : null;
    let timestamp = Date.now().toString();

    updatePost(req.body.title, req.body.url, timestamp, postId, owner)
    .then(result => {
        res.status(200).json(result)
    })
    .catch(err => console.log(err))
})

// GET all posts ORDERED

app.get('/posts_ordered', (req, res) => {    
    let queryNoUsername = `SELECT id, title, url, timestamp, SUM(vote) AS score, owner FROM posts LEFT JOIN votes ON id = post_id
    GROUP BY id ORDER by score DESC;`
    let queryIfUsername = `SELECT id, title, url, timestamp, SUM(v1.vote) AS score, owner, v2.vote FROM posts LEFT JOIN votes v1 ON id = v1.post_id LEFT JOIN votes v2 ON id = v2.post_id AND v2.username = ?
    GROUP BY id ORDER by score DESC;`
    let query = req.headers.username ? queryIfUsername : queryNoUsername;
    let values = req.headers.username ? [req.headers.username] : null;

    queryDb(query, values)
    .then(rows => {
        res.status(200).json({
            'posts': rows
        })
    })
    .catch(err => console.log(err))
});

app.get('/posts_newest', (req, res) => { 
    let queryNoUsername = `SELECT id, title, url, timestamp, SUM(vote) AS score, owner FROM posts LEFT JOIN votes ON id = post_id
    GROUP BY id ORDER by timestamp DESC;`
    let queryIfUsername = `SELECT id, title, url, timestamp, SUM(v1.vote) AS score, owner, v2.vote FROM posts LEFT JOIN votes v1 ON id = v1.post_id LEFT JOIN votes v2 ON id = v2.post_id AND v2.username = ?
    GROUP BY id ORDER by timestamp DESC;`
    let query = req.headers.username ? queryIfUsername : queryNoUsername;
    let values = req.headers.username ? [req.headers.username] : null;

    queryDb(query, values)
    .then(rows => {
        res.status(200).json({
            'posts': rows
        })
    })
    .catch(err => console.log(err))
});

////////////////////////////// USERS /////////////////////////////////////////

// GET all users

app.get('/users', (req, res) => {
    queryDb('SELECT * FROM users')
    .then(rows => {
        res.status(200).json(rows)
    })
    .catch(err => console.log(err))
})

// POST add a user (login)

app.post('/users', (req, res) => {
    let query = 'INSERT INTO users (username) SELECT ? WHERE NOT EXISTS (SELECT * FROM users WHERE username = ?)'

    if(req.body.username) {
        queryDb(query, [req.body.username, req.body.username])
        .then(rows => {
            console.log(`User added with the id ${rows.insertId}`);
            res.status(201).json({
                "id": rows.insertId,
                "username": req.body.username
            })
        })
        .catch(err => console.log(err))
    } else {
        console.log(`Username missing. No user was added`);
        res.status(200).json({
            "message": 'Username missing. No user was added.'
        })
    }
})

// GET user vote count

app.get('/users/:username', (req, res) => {
    queryDb('SELECT username, count(vote) AS voteCount FROM votes WHERE username = ?', [req.params.username])
    .then(rows => {
        res.status(200).json(rows)
    })
    .catch(err => console.log(err))
});

//////////////////////////// SENDING THE HTML FILES /////////////////////////////////////

app.get('/space', (req, res) => {
    res.sendFile(__dirname + '../public/main-page/main.html');
})

app.get('/create_post', (req, res) => {
    res.sendFile(__dirname + '../public/post-form/post-form.html');
})

app.get('/edit_post', (req, res) => {
    res.sendFile(__dirname + '../public/edit-form/edit-form.html');
})

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '../public/login/login.html');
})

// PORT

app.listen(3000, () => {
    console.log(`The server is up and running on 3000`);
});