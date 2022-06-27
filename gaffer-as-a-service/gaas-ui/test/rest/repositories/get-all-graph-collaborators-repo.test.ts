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
import { GetAllGraphCollaboratorsRepo } from "../../../src/rest/repositories/get-all-graph-collaborators-repo";
import { GraphCollaborator } from "../../../src/domain/graph-collaborator";
import { IAllGraphCollaboratorsResponse } from "../../../src/rest/http-message-interfaces/response-interfaces";
import { APIError } from "../../../src/rest/APIError";

const mock = new MockAdapter(axios);
const repo = new GetAllGraphCollaboratorsRepo();

afterEach(() => mock.resetHandlers());

describe("Get All Graph Collaborators Repo", () => {
    it("should return many Graph Collaborators when api returns many", async () => {
        const apiResponse: IAllGraphCollaboratorsResponse = {
            collaborators: [
                {
                    graphId: "roadTraffic",
                    username: "testuser",
                },
                {
                    graphId: "roadTraffic",
                    username: "javainuse",
                },
            ],
        };
        mock.onGet("/collaborators/roadTraffic").reply(200, apiResponse);

        const actual: GraphCollaborator[] = await repo.getAll("roadTraffic");

        const expected = [
            new GraphCollaborator("roadTraffic", "testuser"),
            new GraphCollaborator("roadTraffic", "javainuse"),
        ];
        expect(actual).toEqual(expected);
    });

    it("should return one Graph Collaborator when api returns one", async () => {
        const apiResponse: IAllGraphCollaboratorsResponse = {
            collaborators: [
                {
                    graphId: "roadTraffic",
                    username: "javainuse",
                },
            ],
        };
        mock.onGet("/collaborators/roadTraffic").reply(200, apiResponse);

        const actual: GraphCollaborator[] = await repo.getAll("roadTraffic");

        const expected = [new GraphCollaborator("roadTraffic", "javainuse")];
        expect(actual).toEqual(expected);
    });

    it("should throw APIError with correct status message when no response body", async () => {
        mock.onGet("/collaborators/roadTraffic").reply(404);

        await expect(repo.getAll("roadTraffic")).rejects.toEqual(new APIError("Error Code 404", "Not Found"));
    });

    it("should throw APIError with title and detail from response body", async () => {
        mock.onGet("/collaborators/roadTraffic").reply(404, { title: "Forbidden", detail: "Kubernetes access denied" });

        await expect(repo.getAll("roadTraffic")).rejects.toEqual(new APIError("Forbidden", "Kubernetes access denied"));
    });

    it("should throw unknown APIError when undefined status and body", async () => {
        mock.onGet("/collaborators/roadTraffic").reply(0);

        await expect(repo.getAll("roadTraffic")).rejects.toEqual(
            new APIError("Unknown Error", "Unable to make request")
        );
    });
});
function apiResponse(arg0: number, apiResponse: any) {
    throw new Error("Function not implemented.");
}
