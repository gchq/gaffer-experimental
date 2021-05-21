import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {GetGraphDetailsRepo} from "../../../src/rest/repositories/get-graph-details-repo";
import {RestApiError} from "../../../src/rest/RestApiError";

const mock = new MockAdapter(axios);
const repo = new GetGraphDetailsRepo();

afterEach(() => mock.resetHandlers());
describe("Get Graph Details repo", () => {
    it("should return the graph description", async ()=> {
        const apiResponse: string = "description";

        mock.onGet("graph/config/description").reply(200, apiResponse);

        const actual: string = await repo.getDescription("https://www.testURL.com/")

        const expected ="description";
        expect(actual).toEqual(expected);
    })
    it("should throw RestApiError with correct status message when no response body", async () => {
        mock.onGet("graph/config/description").reply(404);

        await expect(repo.getDescription("https://www.testURL.com/")).rejects.toEqual(new RestApiError("Error Code 404", "Not Found"));
    });
    it("should throw RestApiError with title and detail from response body", async () => {
        mock.onGet("graph/config/description").reply(404, { title: "Forbidden", detail: "Graph is invalid" });

        await expect(repo.getDescription("https://www.testURL.com/")).rejects.toEqual(new RestApiError("Forbidden", "Graph is invalid"));
    });

    it("should throw unknown RestApiError when undefined status and body", async () => {
        mock.onGet("graph/config/description").reply(0);

        await expect(repo.getDescription("https://www.testURL.com/")).rejects.toEqual(new RestApiError("Unknown Error", "Unable to make request"));
    });
})