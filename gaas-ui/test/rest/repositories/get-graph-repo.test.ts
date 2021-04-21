import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { GetGraphRepo } from "../../../src/rest/repositories/get-graph-repo";
import { Graph } from "../../../src/domain/graph";
import { IGraphByIdResponse } from "../../../src/rest/http-message-interfaces/response-interfaces";
import { RestApiError } from "../../../src/rest/RestApiError";
import { GraphType } from "../../../src/domain/graph-type";

const mock = new MockAdapter(axios);
const repo = new GetGraphRepo();

describe("Get Graph By Id Repo", () => {
    it("should return one graph when request is successful", async () => {
        const apiResponse: IGraphByIdResponse = {
            graphId: "graph-1",
            description: "DEPLOYED",
            url: "graph-1 URL",
            status: "UP"
        };
        mock.onGet("/graphs/graph-1").reply(200, apiResponse);

        const actual: Graph = await repo.get("graph-1");

        const expected: Graph = new Graph("graph-1", "DEPLOYED", "graph-1 URL", "UP", GraphType.GAAS_GRAPH);
        expect(actual).toEqual(expected);
    });

    it("should throw RestApiError when 404 and have correct error message when no response body returned", async () => {
        mock.onGet("/graphs/notfound-graph").reply(404);

        await expect(repo.get("notfound-graph")).rejects.toEqual(new RestApiError("Error Code 404", "Not Found"));
    });

    it("should throw RestApiError with title and detail from response body", async () => {
        mock.onGet("/graphs/notfound-graph").reply(500, { title: "Server Error", detail: "Something went wrong" });

        await expect(repo.get("notfound-graph")).rejects.toEqual(
            new RestApiError("Server Error", "Something went wrong")
        );
    });

    it("should throw Unknown RestApiError when status and response body is undefined", async () => {
        mock.onGet("/graphs/notfound-graph").reply(0);

        await expect(repo.get("notfound-graph")).rejects.toEqual(
            new RestApiError("Unknown Error", "Unable to make request")
        );
    });
});
