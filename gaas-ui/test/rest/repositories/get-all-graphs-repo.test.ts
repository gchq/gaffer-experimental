import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { GetAllGraphsRepo } from "../../../src/rest/repositories/get-all-graphs-repo";
import { Graph } from "../../../src/domain/graph";
import { IAllGraphsResponse } from "../../../src/rest/http-message-interfaces/response-interfaces";
import { RestApiError } from "../../../src/rest/RestApiError";
import { GraphType } from "../../../src/domain/graph-type";

const mock = new MockAdapter(axios);
const repo = new GetAllGraphsRepo();

afterEach(() => mock.resetHandlers());

describe("Get All Graphs Repo", () => {
    it("should return many Graphs when api returns many", async () => {
        const apiResponse: IAllGraphsResponse = {
            graphs:[
            {
                graphId: "roadTraffic",
                description: "DEPLOYED",
                url: "roadTraffic URL",
                configName: "mapStore",
                status: "UP"
            },
            {
                graphId: "basicGraph",
                description: "DELETION_QUEUED",
                url: "basicGraph URL",
                configName: "mapStore",
                status: "UP"
            },
        ]};
        mock.onGet("/graphs").reply(200, apiResponse);

        const actual: Graph[] = await repo.getAll();

        const expected = [
            new Graph("roadTraffic", "DEPLOYED", "roadTraffic URL", "UP", "mapStore", GraphType.GAAS_GRAPH),
            new Graph("basicGraph", "DELETION_QUEUED", "basicGraph URL", "UP", "mapStore", GraphType.GAAS_GRAPH)
        ];
        expect(actual).toEqual(expected);
    });

    it("should return one Graph when api returns one", async () => {
        const apiResponse: IAllGraphsResponse = {
            graphs:
            [
                {
                    graphId: "streetTraffic",
                    description: "DELETION_QUEUED",
                    url: "streetTraffic URL",
                    configName: "accumuloStore",
                    status: "UP"
                },
    ]
    };
        mock.onGet("/graphs").reply(200, apiResponse);

        const actual: Graph[] = await repo.getAll();

        const expected = [new Graph("streetTraffic", "DELETION_QUEUED", "streetTraffic URL", "UP", "accumuloStore", GraphType.GAAS_GRAPH)];
        expect(actual).toEqual(expected);
    });

    it("should throw RestApiError with correct status message when no response body", async () => {
        mock.onGet("/graphs").reply(404);

        await expect(repo.getAll()).rejects.toEqual(new RestApiError("Error Code 404", "Not Found"));
    });

    it("should throw RestApiError with title and detail from response body", async () => {
        mock.onGet("/graphs").reply(404, { title: "Forbidden", detail: "Kubernetes access denied" });

        await expect(repo.getAll()).rejects.toEqual(new RestApiError("Forbidden", "Kubernetes access denied"));
    });

    it("should throw unknown RestApiError when undefined status and body", async () => {
        mock.onGet("/graphs").reply(0);

        await expect(repo.getAll()).rejects.toEqual(new RestApiError("Unknown Error", "Unable to make request"));
    });
});