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
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "OPTIONS,POST,GET");
    next();
});

// Token
const jwtSecret = "my-dev-secret";
let token;

app.options("*", cors());
// Sign in
app.post("/auth", (req, res) => {
    const username = String(req.body.username).toLowerCase();

    if (users.has(username) && users.get(username) === req.body.password) {
        token = jwt.sign({ data: username }, jwtSecret, { expiresIn: "1 week" });
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

// Create Graph
app.post("/graphs", (req, res) => {
    try {
        jwt.verify(req.get("Authorization"), jwtSecret, () => {
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
        jwt.verify(req.get("Authorization"), jwtSecret, () => {
            res.send([
                {
                    graphId: "roadTraffic",
                    description: "Road traffic graph. This graphs uses a federated store of proxy stores",
                    url: "http://road-traffic.k8s.cluster/rest",
                    storeType: "federatedStore",
                    status: "UP",
                },
                {
                    graphId: "exampleGraphId",
                    description: "Example Graph description",
                    url: "http://road-traffic.k8s.cluster/rest",
                    storeType: "mapStore",
                    status: "UP",
                },
                {
                    graphId: "accEntitiesClashingGraph",
                    description: "Clashing entities on an Accumulo Store graph",
                    url: "http://acc-entities-2.k8s.cluster/rest",
                    storeType: "accumuloStore",
                    status: "DOWN",
                },
                {
                    graphId: "mapEdges",
                    description: "Map of edge",
                    url: "http://map-edges.k8s.cluster/rest",
                    storeType: "mapStore",
                    status: "UP",
                },
                {
                    graphId: "accEntities",
                    description: "Accumulo graph of entities",
                    url: "http://acc-entities-1.k8s.cluster/rest",
                    storeType: "accumuloStore",
                    status: "UP",
                },
                {
                    graphId: "basicGraph",
                    description: "Basic graph instance using Accumulo",
                    url: "http://basic-graph.k8s.cluster/rest",
                    storeType: "accumuloStore",
                    status: "UP"
                },
                {
                    graphId: "devGraph",
                    description: "Primary dev environment graph",
                    url: "http://dev-environment-1.k8s.cluster/rest",
                    storeType: "mapStore",
                    status: "DOWN"
                },
                {
                    graphId: "devGraph2",
                    description: "Secondary development mode graph",
                    url: "http://dev-environment-2.k8s.cluster/rest",
                    storeType: "mapStore",
                    status: "UP"
                },
                {
                    graphId: "testGaffer",
                    description: "Test instance of Gaffer",
                    url: "http://test-gaffer.k8s.cluster/rest",
                    storeType: "mapStore",
                    status: "UP"
                },
            ]);
        });
    } catch (e) {
        res.status(403).end();
    }
});

// Get graph by ID
app.get("/graphs/:graphId", (req, res) => {
    try {
        jwt.verify(req.get("Authorization"), jwtSecret, () => {
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
        jwt.verify(req.get("Authorization"), jwtSecret, () => {
            res.status(204).end();
        });
    } catch (e) {
        res.status(403).end();
    }
});

app.get("/namespaces", (req, res) => {
    try {
        jwt.verify(req.get("Authorization"), jwtSecret, () => {
            res.status(200).send(["namespace1", "namespace2", "namespace3"]);
        });
    } catch (e) {
        res.status(403).end();
    }
});

app.get("/up/graph/status", (req, res) => {
    console.log(req.url)
    res.status(200).send({ status: "UP" });
});

app.get("/up/graph/config/description", (req, res) => {
    console.log(req.url)
    res.status(200).send("This stubbed graph can be found in middleware.js");
});

app.get("/down/graph/status", (req, res) => {
    console.log(req.url)
    res.status(200).send({ status: "DOWN" });
});

module.exports = server;
