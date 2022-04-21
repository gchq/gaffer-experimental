import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { GetGraphStatusRepo } from "../../../src/rest/repositories/get-graph-status-repo";
import { IGraphStatusResponse } from "../../../src/rest/http-message-interfaces/response-interfaces";
import { APIError } from "../../../src/rest/APIError";

const mock = new MockAdapter(axios);
const repo = new GetGraphStatusRepo();

afterEach(() => mock.resetHandlers());

describe("Get graph status repo", () => {
    it("should return a status of a graph", async () => {
        const apiResponse: IGraphStatusResponse = {
            status: "UP",
        };
        mock.onGet("/graph/status").reply(200, apiResponse);

        const actual: string = await repo.getStatus("https://www.testURL.com/");

        const expected = "UP";
        expect(actual).toEqual(expected);
    });

    it("should throw RestApiError with correct status message when no response body", async () => {
        mock.onGet("/graph/status").reply(404);

        await expect(repo.getStatus("https://www.testURL.com/")).rejects.toEqual(
            new APIError("Error Code 404", "Not Found")
        );
    });

    it("should throw RestApiError with title and detail from response body", async () => {
        mock.onGet("/graph/status").reply(403, { title: "Forbidden", detail: "Graph is invalid" });

        await expect(repo.getStatus("https://www.testURL.com/")).rejects.toEqual(
            new APIError("Forbidden", "Graph is invalid")
        );
    });

    it("should throw unknown RestApiError when undefined status and body", async () => {
        mock.onGet("/graph/status").reply(0);

        await expect(repo.getStatus("https://www.testURL.com/")).rejects.toEqual(
            new APIError("Unknown Error", "Unable to make request")
        );
    });
});
