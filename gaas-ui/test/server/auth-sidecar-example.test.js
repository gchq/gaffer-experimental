import request from "supertest";
import authSidecarExample from "../../server/auth-sidecar-example";
let token;

afterEach(() => {
    authSidecarExample.close();
});
beforeEach(() => (process.env = Object.assign(process.env, { JWT_SECRET: "my-dev-secret" })));
afterAll(() => (process.env = Object.assign(process.env, { JWT_SECRET: "" })));
describe("Auth Sidecar Example", () => {
    describe("/what-auth", () => {
        it("should respond to the get method with a 200 status code and the correct response object", async () => {
            await request(authSidecarExample)
                .get("/what-auth")
                .then((response) => {
                    expect(response.statusCode).toEqual(200);
                    expect(response.body).toEqual({
                        requiredFields: ["username", "password"],
                        requiredHeaders: ["Authorization"],
                    });
                });
        });
    });
    describe("/auth", () => {
        it("Should respond to the POST method with a 200 status code when the username and password is correct", async () => {
            await request(authSidecarExample)
                .post("/auth")
                .send({
                    username: "user@yahoo.com",
                    password: "abc123",
                })
                .expect(200)
                .expect((res) => res.body !== undefined);
        });
        it("Should respond with a 403 code when the POST method is called with the incorrect username and password", async () => {
            await request(authSidecarExample)
                .post("/auth")
                .send({
                    username: "invalidUser",
                    password: "invalidPassword",
                })
                .expect(403);
        });
        it("Should respond with a 204 code when the POST method is called with the sign out path", async () => {
            await request(authSidecarExample).post("/auth").send({
                username: "user@yahoo.com",
                password: "abc123",
            });
            await request(authSidecarExample).post("/auth/signout").expect(204);
        });
    });
    describe("/whoami", () => {
        beforeAll(async () => {
            await request(authSidecarExample)
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
            await request(authSidecarExample)
                .post("/auth")
                .send({
                    username: "user@yahoo.com",
                    password: "abc123",
                })
                .then((response) => {
                    token = response.body;
                });
            await request(authSidecarExample)
                .get("/whoami")
                .set("Authorization", token)
                .then((response) => {
                    expect(response.statusCode).toEqual(200);
                    expect(response.text).toEqual("testEmail@something.com");
                });
        });
    });
});
