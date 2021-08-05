import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { GetGraphDescriptionRepo } from "../../../src/rest/repositories/get-graph-description-repo";
import { RestApiError } from "../../../src/rest/RestApiError";
import {GetGraphIdRepo} from "../../../src/rest/repositories/get-graph-id-repo";

const mock = new MockAdapter(axios);
const getGraphDescriptionRepo = new GetGraphDescriptionRepo();
const getGraphIdRepo = new GetGraphIdRepo();

afterEach(() => mock.resetHandlers());

describe("Get Graph Details repo", () => {
    describe("Graph Description" , () => {
        it("should return the graph description", async ()=> {
            const apiResponse: string = "description";

            mock.onGet("graph/config/description").reply(200, apiResponse);

            const actual: string = await getGraphDescriptionRepo.getDescription("https://www.testURL.com/")

            const expected = "description";
            expect(actual).toEqual(expected);
        })

        it("should throw RestApiError with correct status message when no response body", async () => {
            mock.onGet("graph/config/description").reply(404);

            await expect(getGraphDescriptionRepo.getDescription("https://www.testURL.com/")).rejects.toEqual(new RestApiError("Error Code 404", "Not Found"));
        });

        it("should throw RestApiError with title and detail from response body", async () => {
            mock.onGet("graph/config/description").reply(403, { title: "Forbidden", detail: "Graph is invalid" });

            await expect(getGraphDescriptionRepo.getDescription("https://www.testURL.com/")).rejects.toEqual(new RestApiError("Forbidden", "Graph is invalid"));
        });

        it("should throw unknown RestApiError when undefined status and body", async () => {
            mock.onGet("graph/config/description").reply(0);

            await expect(getGraphDescriptionRepo.getDescription("https://www.testURL.com/")).rejects.toEqual(new RestApiError("Unknown Error", "Unable to make request"));
        });
    })
    describe("Graph Id", ()=> {
        it("should return the graph id", async ()=> {
            const apiResponse: string = "id";

            mock.onGet("graph/config/graphId").reply(200, apiResponse);

            const actual: string = await getGraphIdRepo.getGraphId("https://www.testURL.com/")

            const expected = "id";
            expect(actual).toEqual(expected);
        });
        it("should throw RestApiError with correct status message when no response body", async () => {
            mock.onGet("graph/config/graphId").reply(404);

            await expect(getGraphIdRepo.getGraphId("https://www.testURL.com/")).rejects.toEqual(new RestApiError("Error Code 404", "Not Found"));
        });

        it("should throw RestApiError with title and detail from response body", async () => {
            mock.onGet("graph/config/graphId").reply(403, { title: "Forbidden", detail: "Graph is invalid" });

            await expect(getGraphIdRepo.getGraphId("https://www.testURL.com/")).rejects.toEqual(new RestApiError("Forbidden", "Graph is invalid"));
        });

        it("should throw unknown RestApiError when undefined status and body", async () => {
            mock.onGet("graph/config/graphId").reply(0);

            await expect(getGraphIdRepo.getGraphId("https://www.testURL.com/")).rejects.toEqual(new RestApiError("Unknown Error", "Unable to make request"));
        });
    })




});
