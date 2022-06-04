/*
 * Copyright 2021-2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const express = require("express");
const jwt = require("jsonwebtoken");
const users = require("./users");
const cors = require("cors");

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
    try {
        jwt.verify(req.get("Authorization"), process.env.JWT_SECRET, () => {
            res.status(200).send({
                attributes: {
                    withCredentials: true,
                },
                requiredFields: ["username", "password"],
                requiredHeaders: { Authorization: "Bearer " },
            });
        });
    } catch (e) {
        res.status(404).send(e.message).end();
    }
});
// Sign in
app.post("/auth", (req, res) => {
    const username = String(req.body.username).toLowerCase();
    if (users.has(username) && users.get(username) === req.body.password) {
        token = jwt.sign({ data: username }, process.env.JWT_SECRET, { expiresIn: "1 week" });
        res.status(200).send(token);
    } else {
        res.status(403).end("Failed to login");
    }
});

// Sign out
app.post("/auth/signout", (req, res) => {
    token = "";
    res.status(204).end();
});

app.get("/whoami", (req, res) => {
    try {
        jwt.verify(req.get("Authorization"), process.env.JWT_SECRET, () => {
            res.status(200).send("testEmail@something.com");
        });
    } catch (e) {
        res.status(404).send(e.message).end();
    }
});
