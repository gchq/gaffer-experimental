import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { AuthSidecarClient } from "../../../src/rest/clients/auth-sidecar-client";

const mock = new MockAdapter(axios);
const authSidecarClient = new AuthSidecarClient();

describe("Auth Sidecar Client", () => {
    describe("/what-auth", () => {
        it("should return 200 status and a valid response when GET is successful", async () => {
            mock.onGet("/what-auth").reply(200, {
                requiredFields: ["username", "password"],
                requiredHeaders: ["Authorization"],
            });

            const actualResponse = await authSidecarClient.getWhatAuth();
            expect(actualResponse).toEqual({
                requiredFields: ["username", "password"],
                requiredHeaders: ["Authorization"],
            });
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
    });
    describe("/auth", () => {
        it("Should return 200 status and a valid response when POST request is successful", () => {
            mock.onPost("/auth").reply(200, "thisIsAValidToken");
            const actualResponse = authSidecarClient;
            expect(actualResponse).toEqual({
                status: 200,
                data: "thisIsAValidToken",
            });
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
        it("should return 200 status and a valid response when GET is successful", () => {
            mock.onGet("/whoami").reply(200, { "x-email": "test@test.com" });
            const actualResponse = authSidecarClient;

            expect(actualResponse).toEqual({
                status: 200,
                data: {
                    "x-email": "test@test.com",
                },
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
});
