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
