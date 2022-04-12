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
            const postMap = new Map<string, string>();
            postMap.set("username", "validuser");
            postMap.set("password", "password");
            await authSidecarClient.postAuth(postMap);
            expect(AuthSidecarClient.getToken()).toEqual("thisIsAValidToken");
        });
        it("Should return 403 status and an error message when GET request is unsuccessful", async () => {
            const postMap = new Map<string, string>();
            postMap.set("username", "invalid");
            mock.onGet("/auth").reply(403, {
                title: "Forbidden",
                detail: "Invalid Auth credentials",
            });
            try {
                await authSidecarClient.postAuth(postMap);
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
            it("Should throw error when requiredFields response is not an array from GET /what-auth", async () => {
                const expectedData = {
                    attributes: { withCredentials: true },
                    requiredFields: 44,
                    requiredHeaders: { Authorization: "Bearer  " },
                };
                mock.onGet("/what-auth").reply(200, expectedData);
                try {
                    await authSidecarClient.getWhatAuth();
                } catch (e) {
                    expect(e).toEqual("Invalid Response");
                }
            });
        });
        describe("requiredHeaders", () => {
            it("should get the correct requiredHeaders set on GET /what-auth", () => {
                const expected = { Authorization: "Bearer  " };

                expect(AuthSidecarClient.getRequiredHeaders()).toEqual(expected);
            });
            it("Should throw error when requiredHeaders response is not an object from GET /what-auth", async () => {
                const expectedData = {
                    attributes: { withCredentials: true },
                    requiredFields: ["username", "password"],
                    requiredHeaders: true,
                };
                mock.onGet("/what-auth").reply(200, expectedData);
                try {
                    await authSidecarClient.getWhatAuth();
                } catch (e) {
                    expect(e).toEqual("Invalid Response");
                }
            });
        });
        describe("attributes", () => {
            it("should get the correct attributes set on GET /what-auth", () => {
                const expected = {
                    withCredentials: true,
                };

                expect(AuthSidecarClient.getAttributes()).toEqual(expected);
            });
            it("Should throw error when attributes response is not an object from GET /what-auth", async () => {
                const expectedData = {
                    attributes: 12,
                    requiredFields: ["username", "password"],
                    requiredHeaders: { Authorization: "Bearer  " },
                };
                mock.onGet("/what-auth").reply(200, expectedData);
                try {
                    await authSidecarClient.getWhatAuth();
                } catch (e) {
                    expect(e).toEqual("Invalid Response");
                }
            });
        });
    });
});
