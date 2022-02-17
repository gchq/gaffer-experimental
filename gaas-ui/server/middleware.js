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
                        graphId: "roadtraffic",
                        description: "Road traffic graph. This graphs uses a federated store of proxy stores",
                        url: "http://roadtraffic-namespace.host-name/ui",
                        restUrl: "http://roadtraffic-namespace.host-name/rest",
                        configName: "federated",
                        status: "UP",
                    },
                    {
                        graphId: "roadtraffic1",
                        description: "Example Graph description",
                        url: "http://roadtraffic1-namespace.host-name/ui",
                        restUrl: "http://roadtraffic1-namespace.host-name/rest",
                        configName: "mapStore",
                        status: "UP",
                    },
                    {
                        graphId: "roadtraffic2",
                        description: "Clashing entities on an Accumulo Store graph",
                        url: "http://roadtraffic2-namespace.host-name/ui",
                        restUrl: "http://roadtraffic2-namespace.host-name/rest",
                        configName: "accumuloStore",
                        status: "DOWN",
                    },
                    {
                        graphId: "roadtraffic3",
                        description: "Map of edge",
                        url: "http://roadtraffic3-namespace.host-name/ui",
                        restUrl: "http://roadtraffic3-namespace.host-name/rest",
                        configName: "mapStore",
                        status: "UP",
                    },
                    {
                        graphId: "roadtraffic4",
                        description: "Accumulo graph of entities",
                        url: "http://roadtraffic4-namespace.host-name/ui",
                        restUrl: "http://roadtraffic4-namespace.host-name/rest",
                        configName: "accumuloStore",
                        status: "UP",
                    },
                    {
                        graphId: "roadtraffic5",
                        description: "Basic graph instance using Accumulo",
                        url: "http://roadtraffic5-namespace.host-name/ui",
                        restUrl: "http://roadtraffic5-namespace.host-name/rest",
                        configName: "accumuloStore",
                        status: "UP",
                    },
                    {
                        graphId: "roadtraffic5",
                        description: "Primary dev environment graph",
                        url: "http://roadtraffic5-namespace.host-name/ui",
                        restUrl: "http://roadtraffic5-namespace.host-name/rest",
                        configName: "mapStore",
                        status: "DOWN",
                    },
                    {
                        graphId: "roadtraffic6",
                        description: "Secondary development mode graph",
                        url: "http://roadtraffic6-namespace.host-name/ui",
                        restUrl: "http://roadtraffic6-namespace.host-name/rest",
                        configName: "mapStore",
                        status: "UP",
                    },
                    {
                        graphId: "roadtraffic6",
                        description: "Test instance of Gaffer",
                        url: "http://roadtraffic6-namespace.host-name/ui",
                        restUrl: "http://roadtraffic6-namespace.host-name/rest",
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
