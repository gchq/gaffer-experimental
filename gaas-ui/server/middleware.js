const express = require("express");
const jwt = require("jsonwebtoken");
const users = require("./users");
var cors = require("cors");

// app
const app = express();
const port = process.env.PORT || 4000;
const server = app.listen(port, () => console.log(`Listening on port ${port}`));

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

// Create Graph
app.post("/graphs", (req, res) => {
    try {
        jwt.verify(req.get("Authorization"), process.env.JWT_SECRET, () => {
            if (req.body.graphId === "fail") {
                res.status(500).send({ title: "Server Error", detail: "Failed to delete graph" });
            } else {
                res.status(201).end();
            }
        });
    } catch (e) {
        res.status(403).end();
    }
});

// Get all graphs
app.get("/graphs", (req, res) => {
    try {
        jwt.verify(req.get("Authorization"), process.env.JWT_SECRET, () => {
            res.send({
                graphs: [
                    {
                        graphId: "federated",
                        description: "Road traffic graph. This graphs uses a federated store of proxy stores",
                        url: "http://federated-namespace.host-name/ui",
                        restUrl: "http://federated-namespace.host-name/rest",
                        configName: "federated",
                        status: "UP",
                    },
                    {
                        graphId: "mapstore1",
                        description: "Example Graph description",
                        url: "http://mapstore1-namespace.host-name/ui",
                        restUrl: "http://mapstore1-namespace.host-name/rest",
                        configName: "mapStore",
                        status: "UP",
                    },
                    {
                        graphId: "accumulodown",
                        description: "Clashing entities on an Accumulo Store graph",
                        url: "http://accumulodown-namespace.host-name/ui",
                        restUrl: "http://accumulodown-namespace.host-name/rest",
                        configName: "accumuloStore",
                        status: "DOWN",
                    },
                    {
                        graphId: "mapstore2",
                        description: "Map of edge",
                        url: "http://mapstore2-namespace.host-name/ui",
                        restUrl: "http://mapstore2-namespace.host-name/rest",
                        configName: "mapStore",
                        status: "UP",
                    },
                    {
                        graphId: "accumulo1",
                        description: "Accumulo graph of entities",
                        url: "http://accumulo1-namespace.host-name/ui",
                        restUrl: "http://accumulo1-namespace.host-name/rest",
                        configName: "accumuloStore",
                        status: "UP",
                    },
                    {
                        graphId: "accumulo2",
                        description: "Basic graph instance using Accumulo",
                        url: "http://accumulo2-namespace.host-name/ui",
                        restUrl: "http://accumulo2-namespace.host-name/rest",
                        configName: "accumuloStore",
                        status: "UP",
                    },
                    {
                        graphId: "mapstoredown",
                        description: "Primary dev environment graph",
                        url: "http://mapstoredown-namespace.host-name/ui",
                        restUrl: "http://mapstoredown-namespace.host-name/rest",
                        configName: "mapStore",
                        status: "DOWN",
                    },
                    {
                        graphId: "mapstore3",
                        description: "Secondary development mode graph",
                        url: "http://mapstore3-namespace.host-name/ui",
                        restUrl: "http://mapstore3-namespace.host-name/rest",
                        configName: "mapStore",
                        status: "UP",
                    },
                    {
                        graphId: "mapstore4",
                        description: "Test instance of Gaffer",
                        url: "http://mapstore4-namespace.host-name/ui",
                        restUrl: "http://mapstore4-namespace.host-name/rest",
                        configName: "mapStore",
                        status: "UP",
                    },
                ],
            });
        });
    } catch (e) {
        res.status(403).end();
    }
});

// Get graph by ID
app.get("/graphs/:graphId", (req, res) => {
    try {
        jwt.verify(req.get("Authorization"), process.env.JWT_SECRET, () => {
            res.status(200).send({
                graphId: req.params.graphId,
                description: "DEPLOYED",
            });
        });
    } catch (e) {
        res.status(403).end();
    }
});

// Delete graph by ID
app.delete("/graphs/:graphId", (req, res) => {
    try {
        jwt.verify(req.get("Authorization"), process.env.JWT_SECRET, () => {
            res.status(204).end();
        });
    } catch (e) {
        res.status(403).end();
    }
});

app.get("/namespaces", (req, res) => {
    try {
        jwt.verify(req.get("Authorization"), process.env.JWT_SECRET, () => {
            res.status(200).send(["namespace1", "namespace2", "namespace3"]);
        });
    } catch (e) {
        res.status(403).end();
    }
});
app.get("/storetypes", (req, res) => {
    try {
        jwt.verify(req.get("Authorization"), process.env.JWT_SECRET, () => {
            res.status(200).send({
                storeTypes: [
                    {
                        name: "accumuloSmall",
                        parameters: ["schema"],
                    },
                    {
                        name: "accumulo",
                        parameters: ["schema"],
                    },
                    {
                        name: "mapStore",
                        parameters: ["schema"],
                    },
                    {
                        name: "accumuloBig",
                        parameters: ["schema"],
                    },
                    {
                        name: "federated",
                        parameters: ["proxies"],
                    },
                ],
            });
        });
    } catch (e) {
        res.status(403).end();
    }
});

app.get("/up/graph/status", (req, res) => {
    res.status(200).send({ status: "UP" });
});

app.get("/up/graph/config/graphId", (req, res) => {
    res.status(200).send("middleware.js-graph");
});

app.get("/up/graph/config/description", (req, res) => {
    res.status(200).send("This stubbed graph can be found in middleware.js");
});

app.get("/down/graph/status", (req, res) => {
    res.status(200).send({ status: "DOWN" });
});

app.post("/rest/graph/operations/execute", (req, res) => {
    res.status(200).send(["mapEdges", "accEntities"]);
});

module.exports = server;
