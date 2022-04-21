/*
 * Copyright 2021-2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */

import request from "supertest";
import server from "../../server/middleware";

let token: string;

afterEach(() => {
    server.close();
});

beforeEach(() => (process.env = Object.assign(process.env, { JWT_SECRET: "my-dev-secret" })));
afterAll(() => (process.env = Object.assign(process.env, { JWT_SECRET: "" })));
describe("Auth", () => {
    it("Should respond to the POST method with a 200 status code when the username and password is correct", async () => {
        await request(server)
            .post("/auth")
            .send({
                username: "user@yahoo.com",
                password: "abc123",
            })
            .expect(200)
            .expect((res) => res.body !== undefined);
    });
    it("Should respond with a 403 code when the POST method is called with the incorrect username and password", async () => {
        await request(server)
            .post("/auth")
            .send({
                username: "invalidUser",
                password: "invalidPassword",
            })
            .expect(403);
    });
    it("Should respond with a 204 code when the POST method is called with the sign out path", async () => {
        await request(server).post("/auth").send({
            username: "user@yahoo.com",
            password: "abc123",
        });
        await request(server).post("/auth/signout").expect(204);
    });
});
describe("whoami", () => {
    beforeAll(async () => {
        await request(server)
            .post("/auth")
            .send({
                username: "user@yahoo.com",
                password: "abc123",
            })
            .then((response) => {
                token = response.body;
            });
    });
    it("Should respond to a GET request with 200 code and email when user is logged in", async () => {
        await request(server)
            .post("/auth")
            .send({
                username: "user@yahoo.com",
                password: "abc123",
            })
            .then((response) => {
                token = response.body;
            });
        await request(server)
            .get("/whoami")
            .set("Authorization", token)
            .then((response) => {
                expect(response.statusCode).toEqual(200);
                expect(response.text).toEqual("testEmail@something.com");
            });
    });
});

describe("Graph API", () => {
    beforeAll(async () => {
        await request(server)
            .post("/auth")
            .send({
                username: "user@yahoo.com",
                password: "abc123",
            })
            .then((response) => {
                token = response.body;
            });
    });
    it("Should respond with a 201 code when post is called with the graphs path and user is signed in", async () => {
        await request(server)
            .post("/graphs")
            .set("Authorization", token)
            .send({
                graphId: "validGraph",
                description: "CREATING",
            })
            .expect(201);
    });
    it("Should respond with a 500 code when post is called with the graphs path and user is signed in", async () => {
        await request(server)
            .post("/graphs")
            .set("Authorization", token)
            .send({
                graphId: "fail",
                description: "FAILED",
            })
            .expect(500);
    });
    it("Should respond with graphs when GET is called with the graphs path and user is signed in", async () => {
        await request(server)
            .get("/graphs")
            .set("Authorization", token)
            .then((response) => {
                // @ts-ignore
                expect(response.statusCode).toBe(200);
                expect(response.body).toStrictEqual({
                    graphs: [
                        {
                            graphId: "federated",
                            description: "Road traffic graph. This graphs uses a federated store of proxy stores",
                            url: "http://federated-namespace.host-name/ui",
                            restUrl: "http://localhost:4000/rest",
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
    });
    it("Should respond with a graph when GET is called with the graphs path and user is signed in", async () => {
        await request(server)
            .get("/graphs/roadTraffic")
            .set("Authorization", token)
            .then((response) => {
                // @ts-ignore
                expect(response.statusCode).toBe(200);
                expect(response.body).toStrictEqual({
                    graphId: "roadTraffic",
                    description: "DEPLOYED",
                });
            });
    });
    it("Should respond with a 204 code when GET is called with the graphs path and user is signed in", async () => {
        await request(server)
            .delete("/graphs/roadTraffic")
            .set("Authorization", token)
            .then((response) => {
                // @ts-ignore
                expect(response.statusCode).toBe(204);
            });
    });
});
describe("Namespaces", () => {
    beforeAll(async () => {
        await request(server)
            .post("/auth")
            .send({
                username: "user@yahoo.com",
                password: "abc123",
            })
            .then((response) => {
                token = response.body;
            });
    });
    it("namespaces endpoint with Authorization token should return namespaces array", async () => {
        await request(server)
            .get("/namespaces")
            .set("Authorization", token)
            .then((response) => {
                // @ts-ignore
                expect(response.statusCode).toBe(200);
                expect(response.body).toStrictEqual(["namespace1", "namespace2", "namespace3"]);
            });
    });
});
describe("Storetypes", () => {
    beforeAll(async () => {
        await request(server)
            .post("/auth")
            .send({
                username: "user@yahoo.com",
                password: "abc123",
            })
            .then((response) => {
                token = response.body;
            });
    });
    it("storetypes endpoint with Authorization token should return storetypes", async () => {
        await request(server)
            .get("/storetypes")
            .set("Authorization", token)
            .then((response) => {
                // @ts-ignore
                expect(response.statusCode).toBe(200);
                expect(response.body).toStrictEqual({
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
    });
});
export {};
