const express = require('express');
const jwt = require('jsonwebtoken');
const users = require('./users');
var cors = require('cors')

// app
const app = express();
const port = process.env.PORT || 4000;
const server = app.listen(port, () => console.log(`Listening on port ${port}`));
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'OPTIONS,POST,GET');
    next();
});
// Token
const jwtSecret = 'my-dev-secret';
let token;

app.options('*', cors()) 
// Sign in
app.post('/auth', (req, res) => {
    const username = String(req.body.username).toLowerCase();

    if (users.has(username) && users.get(username) === req.body.password) {
        token = jwt.sign({ data: username }, jwtSecret, { expiresIn: '1 week' });
        res.status(200).send(token);
    } else {
        res.status(403).end();
    }
});

// Sign out
app.post('/auth/signout', (req, res) => {
    token = '';
    res.status(204).end();
});

// Create Graph
app.post('/graphs', (req, res) => {
    try {
        jwt.verify(req.get('Authorization'), jwtSecret, () => {
            if (req.body.graphId === 'fail') {
                res.status(500).send({details: 'Server Error', message: 'Failed to delete graph'});
            } else {
                res.status(201).end();
            }
        });
    } catch (e) {
        res.status(403).end();
    }
});

// Get all graphs
app.get('/graphs', (req, res) => {
    try {
        jwt.verify(req.get('Authorization'), jwtSecret, () => {
            res.send([
                {
                    graphId: 'roadTraffic',
                    description: 'DEPLOYED',
                },
                {
                    graphId: 'basicGraph',
                    description: 'DEPLOYED',
                },
            ]);
        });
    } catch (e) {
        res.status(403).end();
    }
});

// Get graph by ID
app.get('/graphs/:graphId', (req, res) => {
    try {
        jwt.verify(req.get('Authorization'), jwtSecret, () => {
            res.status(200).send({
                graphId: req.params.graphId,
                description: 'DEPLOYED',
            });
        });
    } catch (e) {
        res.status(403).end();
    }
});

// Delete graph by ID
app.delete('/graphs/:graphId', (req, res) => {
    try {
        jwt.verify(req.get('Authorization'), jwtSecret, () => {
            res.status(202).end();
        });
    } catch (e) {
        res.status(403).end();
    }
});
module.exports = server;
