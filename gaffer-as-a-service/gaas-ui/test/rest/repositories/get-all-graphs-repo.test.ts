/*
 * Copyright 2021-2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { GetAllGraphsRepo } from "../../../src/rest/repositories/get-all-graphs-repo";
import { Graph } from "../../../src/domain/graph";
import { IAllGraphsResponse } from "../../../src/rest/http-message-interfaces/response-interfaces";
import { APIError } from "../../../src/rest/APIError";
import { GraphType } from "../../../src/domain/graph-type";

const mock = new MockAdapter(axios);
const repo = new GetAllGraphsRepo();

afterEach(() => mock.resetHandlers());

describe("Get All Graphs Repo", () => {
    it("should return many Graphs when api returns many", async () => {
        const apiResponse: IAllGraphsResponse = {
            graphs: [
                {
                    graphId: "roadTraffic",
                    description: "DEPLOYED",
                    url: "roadTraffic URL",
                    restUrl: "roadTraffic URL rest",
                    configName: "mapStore",
                    graphAutoDestroyDate: "2022-06-09t15:55:34.006",
                    status: "UP",
                },
                {
                    graphId: "basicGraph",
                    description: "DELETION_QUEUED",
                    url: "basicGraph URL",
                    restUrl: "basicGraph URL rest",
                    configName: "mapStore",
                    graphAutoDestroyDate: "2022-06-09t15:55:34.006",
                    status: "UP",
                },
            ],
        };
        mock.onGet("/graphs").reply(200, apiResponse);

        const actual: Graph[] = await repo.getAll();

        const expected = [
            new Graph(
                "roadTraffic",
                "DEPLOYED",
                "roadTraffic URL",
                "roadTraffic URL rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
            new Graph(
                "basicGraph",
                "DELETION_QUEUED",
                "basicGraph URL",
                "basicGraph URL rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ];
        expect(actual).toEqual(expected);
    });

    it("should return one Graph when api returns one", async () => {
        const apiResponse: IAllGraphsResponse = {
            graphs: [
                {
                    graphId: "streetTraffic",
                    description: "DELETION_QUEUED",
                    url: "streetTraffic URL",
                    restUrl: "streetTraffic URL rest",
                    configName: "accumuloStore",
                    graphAutoDestroyDate: "2022-06-09t15:55:34.006",
                    status: "UP",
                },
            ],
        };
        mock.onGet("/graphs").reply(200, apiResponse);

        const actual: Graph[] = await repo.getAll();

        const expected = [
            new Graph(
                "streetTraffic",
                "DELETION_QUEUED",
                "streetTraffic URL",
                "streetTraffic URL rest",
                "UP",
                "accumuloStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ];
        expect(actual).toEqual(expected);
    });

    it("should throw APIError with correct status message when no response body", async () => {
        mock.onGet("/graphs").reply(404);

        await expect(repo.getAll()).rejects.toEqual(new APIError("Error Code 404", "Not Found"));
    });

    it("should throw APIError with title and detail from response body", async () => {
        mock.onGet("/graphs").reply(404, { title: "Forbidden", detail: "Kubernetes access denied" });

        await expect(repo.getAll()).rejects.toEqual(new APIError("Forbidden", "Kubernetes access denied"));
    });

    it("should throw unknown APIError when undefined status and body", async () => {
        mock.onGet("/graphs").reply(0);

        await expect(repo.getAll()).rejects.toEqual(new APIError("Unknown Error", "Unable to make request"));
    });
});
