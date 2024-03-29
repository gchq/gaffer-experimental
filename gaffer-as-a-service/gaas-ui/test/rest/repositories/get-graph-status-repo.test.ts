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

    it("should throw APIError with correct status message when no response body", async () => {
        mock.onGet("/graph/status").reply(404);

        await expect(repo.getStatus("https://www.testURL.com/")).rejects.toEqual(
            new APIError("Error Code 404", "Not Found")
        );
    });

    it("should throw APIError with title and detail from response body", async () => {
        mock.onGet("/graph/status").reply(403, { title: "Forbidden", detail: "Graph is invalid" });

        await expect(repo.getStatus("https://www.testURL.com/")).rejects.toEqual(
            new APIError("Forbidden", "Graph is invalid")
        );
    });

    it("should throw unknown APIError when undefined status and body", async () => {
        mock.onGet("/graph/status").reply(0);

        await expect(repo.getStatus("https://www.testURL.com/")).rejects.toEqual(
            new APIError("Unknown Error", "Unable to make request")
        );
    });
});
