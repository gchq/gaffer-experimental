const express = require("express");
const jwt = require("jsonwebtoken");
const users = require("./users");
var cors = require("cors");

// app
const app = express();
const port = process.env.PORT || 4001;
const authSidecarExample = app.listen(port, () => console.log(`Listening on port ${port}`));
module.exports = authSidecarExample;

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000/");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "OPTIONS,POST,GET");
    next();
});

// Token
let token;

app.use(cors());
app.get("/what-auth", (req, res) => {
    res.status(200).send({
        requiredFields: ["username", "password"],
        requiredHeaders: ["Authorization"],
    });
});
// Sign in
app.post("/auth", (req, res) => {
    const username = String(req.body.username).toLowerCase();
    if (users.has(username) && users.get(username) === req.body.password) {
        token = jwt.sign({ data: username }, process.env.JWT_SECRET, { expiresIn: "1 week" });
        res.status(200).send(token);
    } else {
        res.status(403).end();
    }
});

// Sign out
app.post("/auth/signout", (req, res) => {
    token = "";
    res.status(204).end();
});

app.get("/whoami", (req, res, next) => {
    try {
        jwt.verify(req.get("Authorization"), process.env.JWT_SECRET, () => {
            res.status(200).send("testEmail@something.com");
        });
    } catch (e) {
        res.status(404).send(e.message).end();
    }
});
