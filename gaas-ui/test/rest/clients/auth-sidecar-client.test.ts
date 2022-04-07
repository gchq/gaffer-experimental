import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { AuthSidecarClient, IWhatAuthInfo } from "../../../src/rest/clients/auth-sidecar-client";

const mock = new MockAdapter(axios);
const authSidecarClient = new AuthSidecarClient();

describe("Auth Sidecar Client", () => {
    describe("/what-auth", () => {
        it("should return 200 status and a valid response when GET is successful", async () => {
            const expectedData: IWhatAuthInfo = {
                attributes: {
                    withCredentials: true,
                },
                requiredFields: ["username", "password"],
                requiredHeaders: { Authorization: "Bearer  " },
            };
            mock.onGet("/what-auth").reply(200, expectedData);

            const actualResponse = await authSidecarClient.getWhatAuth();
            expect(actualResponse).toEqual(expectedData);
        });
        it("should throw 404 and an Error Message when GET is unsuccessful", async () => {
            mock.onGet("/what-auth").reply(404, {
                title: "Not Found",
                detail: "/what-auth endpoint not found",
            });
            try {
                await authSidecarClient;
            } catch (e) {
                expect(e).toEqual({ detail: "Not Found", title: "/what-auth endpoint not found" });
            }
        });
        it("should throw an error if the response is invalid from a successful GET", async () => {
            const data: object = {
                requiredFields: true,
                requiredHeaders: ["testHeader"],
                testAttribute: true,
            };
            mock.onGet("/what-auth").reply(200, data);
            try {
                await authSidecarClient.getWhatAuth();
            } catch (e) {
                expect(e).toEqual("Invalid Response");
            }
        });
    });
    describe("/auth", () => {
        it("Should return 200 status and a valid response when POST request is successful", async () => {
            mock.onPost("/auth").reply(200, "thisIsAValidToken");
            const actualResponse = await authSidecarClient.postAuth({
                username: "testUsername",
                password: "testPassword",
            });
            expect(actualResponse).toEqual("thisIsAValidToken");
        });
        it("Should return 403 status and an error message when GET request is unsuccessful", async () => {
            mock.onGet("/auth").reply(403, {
                title: "Forbidden",
                detail: "Invalid Auth credentials",
            });
            try {
                await authSidecarClient;
            } catch (e) {
                expect(e).toEqual({ detail: "Forbidden", title: "Invalid Auth credentials" });
            }
        });
    });
    describe("/whoami", () => {
        it("should return 200 status and a valid response when GET is successful", async () => {
            mock.onGet("/whoami").reply(200, { "x-email": "test@test.com" });
            const actualResponse = await authSidecarClient.getWhoAmI();

            expect(actualResponse).toEqual({
                "x-email": "test@test.com",
            });
        });
        it("should throw 404 and an error message when GET is unsuccessful", async () => {
            mock.onGet("/whoami").reply(404, {
                title: "Not Found",
                detail: "User Email not found",
            });
            try {
                await authSidecarClient;
            } catch (e) {
                expect(e).toEqual({ detail: "User Email not found", title: "Not Found" });
            }
        });
    });
    describe("Auth Sidecar Client attributes", () => {
        beforeAll(async () => {
            const expectedData: IWhatAuthInfo = {
                attributes: {
                    withCredentials: true,
                },
                requiredFields: ["username", "password"],
                requiredHeaders: { Authorization: "Bearer  " },
            };
            mock.onGet("/what-auth").reply(200, expectedData);
            await authSidecarClient.getWhatAuth();
        });
        describe("requiredFields", () => {
            it("should get the correct requiredFields set on GET /what-auth", () => {
                const expected = ["username", "password"];

                expect(AuthSidecarClient.getRequiredFields()).toEqual(expected);
            });
        });
        describe("requiredHeaders", () => {
            it("should get the correct requiredHeaders set on GET /what-auth", () => {
                const expected = { Authorization: "Bearer  " };

                expect(AuthSidecarClient.getRequiredHeaders()).toEqual(expected);
            });
        });
        describe("attributes", () => {
            it("should get the correct attributes set on GET /what-auth", () => {
                const expected = {
                    withCredentials: true,
                };

                expect(AuthSidecarClient.getAttributes()).toEqual(expected);
            });
        });
    });
});
