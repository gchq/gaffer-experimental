import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { RestClient } from "../../../src/rest/clients/rest-client";

const mock = new MockAdapter(axios);

describe("RestClient 2** Responses", () => {
    beforeAll(() =>
        mock
            .onGet("/graphs")
            .reply(200, [{ graphId: "any-graph", currentStatus: "DEPLOYED" }])
            .onGet("/graphs/graph-1")
            .reply(200, { graphId: "graph-1", currentStatus: "DELETED" })
            .onPost("/graphs", { post: "this" })
            .reply(201)
            .onDelete("/graphs/redundant-graph")
            .reply(202)
            .onGet("/graph/status")
            .reply(200, {status: "UP"})
            .onGet("/graph/config/description")
            .reply(200, "test")
            .onGet("/graph/config/graphId")
            .reply(200, "test")
    );
    afterAll(() => mock.resetHandlers());

    it("should return status/data when GET is successful", async () => {
        const actual = await new RestClient().get().graphs().execute();

        expect(actual).toEqual({
            status: 200,
            data: [
                {
                    graphId: "any-graph",
                    currentStatus: "DEPLOYED",
                },
            ],
        });
    });
    it("should return status/data when GET with a path variable is successful", async () => {
        const actual = await new RestClient().get().graphs("graph-1").execute();

        expect(actual).toEqual({
            status: 200,
            data: {
                graphId: "graph-1",
                currentStatus: "DELETED",
            },
        });
    });
    it("should return status when POST with request body is successful", async () => {
        const actual = await new RestClient().post().graphs().requestBody({ post: "this" }).execute();

        expect(actual).toEqual({
            status: 201,
        });
    });
    it("should return status when DELETE with path variable is successful", async () => {
        const actual = await new RestClient().delete().graphs("redundant-graph").execute();

        expect(actual).toEqual({
            status: 202,
        });
    });
    it("should return the status when GET status is successful", async () => {
        const actual = await new RestClient().get().status().execute();

        expect(actual).toEqual({
            status: 200,
             data:{
                status: "UP"
            },
        });
    });
    it("should return the description when GET description is successful", async () => {
        const actual = await new RestClient().get().description().execute();

        expect(actual).toEqual({
            status: 200,
             data: "test",
        });
    });
    it("should return the graph id when GET graph id is successful", async () => {
        const actual = await new RestClient().get().graphId().execute();

        expect(actual).toEqual({
            status: 200,
             data: "test",
        });
    });
});

describe("GaaS API 4**/5** Error Responses", () => {
    beforeAll(() =>
        mock
            .onGet("/graphs")
            .reply(400, {
                title: "Validation Failed",
                detail: "Graph ID can not be null",
            })
            .onGet("/graphs/unfindable-graph")
            .reply(404, { title: "Not Found", detail: "Could not find resource" })
            .onPost("/graphs", { request: "not-found" })
            .reply(500, {
                title: "Server Error",
                detail: "Null pointer in back end API",
            })
            .onDelete("/graphs/already-deleted")
            .reply(504, { title: "Server Error", detail: "Timeout" })
            .onGet("/graph/status")
            .reply(404, { title: "Not Found", detail: "Could not find resource" })
            .onGet("/graph/config/description")
            .reply(404, { title: "Not Found", detail: "Could not find resource" })
            .onGet("/graph/config/graphId")
            .reply(404, { title: "Not Found", detail: "Could not find resource" })
    );
    afterAll(() => mock.resetHandlers());

    it("should throw 400 Error Message when api returns 404", async () => {
        try {
            await new RestClient().get().graphs().execute();
            throw new Error("Error did not throw");
        } catch (e) {
            expect(e.toString()).toBe("Validation Failed: Graph ID can not be null");
        }
    });
    it("should throw 404 Error Message when api returns 404 - get graph status", async () => {
        try {
            await new RestClient().get().status().execute();
            throw new Error("Error did not throw");
        } catch (e) {
            expect(e.toString()).toBe("Not Found: Could not find resource");
        }
    });
    it("should throw 404 Error Message when api returns 404 - get graph description", async () => {
        try {
            await new RestClient().get().description().execute();
            throw new Error("Error did not throw");
        } catch (e) {
            expect(e.toString()).toBe("Not Found: Could not find resource");
        }
    });
    it("should throw 404 Error Message when api returns 404 - get graph id", async () => {
        try {
            await new RestClient().get().graphId().execute();
            throw new Error("Error did not throw");
        } catch (e) {
            expect(e.toString()).toBe("Not Found: Could not find resource");
        }
    });
    it("should throw 404 Error Message when api returns 404", async () => {
        try {
            await new RestClient().get().graphs("unfindable-graph").execute();
            throw new Error("Error did not throw");
        } catch (e) {
            expect(e.toString()).toBe("Not Found: Could not find resource");
        }
    });
    it("should throw 500 Error Message when api returns 404", async () => {
        try {
            await new RestClient().post().graphs().requestBody({ request: "not-found" }).execute();
            throw new Error("Error did not throw");
        } catch (e) {
            expect(e.toString()).toBe("Server Error: Null pointer in back end API");
        }
    });
    it("should throw 504 Error Message when api returns 404", async () => {
        try {
            await new RestClient().delete().graphs("already-deleted").execute();
            throw new Error("Error did not throw");
        } catch (e) {
            expect(e.toString()).toBe("Server Error: Timeout");
        }
    });
});

describe("Gaffer REST API 4**/5** Error Responses", () => {
    beforeAll(() =>
        mock
            .onGet("/graph/config/graphid")
            .reply(403, {
                statusCode: 403,
                status: "Forbidden",
                simpleMessage: "User does not have permission to run operation: uk.gov.gchq.gaffer.operation.impl.GetVariables"
              })
            .onPost("/graph/status")
            .reply(404, {
                statusCode: 404
              })
    );
    afterAll(() => mock.resetHandlers());

    it("should throw Error with simpleMessage when Gaffer API returns error response body", async () => {
        try {
            await new RestClient().get().urlPath("/graph/config/graphid").execute();
            throw new Error("Error did not throw");
        } catch (e) {
            expect(e.toString()).toBe("Forbidden: User does not have permission to run operation: uk.gov.gchq.gaffer.operation.impl.GetVariables");
        }
    });
    it("should throw generic status code error message when Gaffer API error response is not an instanceof", async () => {
        try {
            await new RestClient().get().urlPath("/graph/status").execute();
            throw new Error("Error did not throw");
        } catch (e) {
            expect(e.toString()).toBe("Error Code 404: Not Found");
        }
    });
});
