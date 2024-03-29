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
import { IStoreTypesResponse } from "../../../src/rest/http-message-interfaces/response-interfaces";
import { GetStoreTypesRepo, IStoreTypes } from "../../../src/rest/repositories/get-store-types-repo";
import { APIError } from "../../../src/rest/APIError";

const mock = new MockAdapter(axios);
const repo = new GetStoreTypesRepo();

afterEach(() => mock.resetHandlers());

describe("Get Store Types Repository", () => {
    it("should return a list of store type config names", async () => {
        const apiResponse: IStoreTypesResponse = {
            storeTypes: [
                {
                    name: "accumuloSmall",
                    parameters: ["schema"],
                },
                {
                    name: "accumulo",
                    parameters: ["schema"],
                },
                {
                    name: "proxy",
                    parameters: ["schema"],
                },
                {
                    name: "mapStore",
                    parameters: ["schema"],
                },
                {
                    name: "accumuloBig",
                    parameters: ["schema"],
                },
                {
                    name: "federated",
                    parameters: ["proxies"],
                },
            ],
        };
        mock.onGet("/storetypes").reply(200, apiResponse);

        const actual: IStoreTypes = await repo.get();

        const expectedStoretypes = ["accumuloSmall", "accumulo", "proxy", "mapStore", "accumuloBig"];
        const expectedFederatedStoreTypes = ["federated"];

        expect(actual.storeTypes).toEqual(expectedStoretypes);
        expect(actual.federatedStoreTypes).toEqual(expectedFederatedStoreTypes);
    });

    it("should throw APIError with correct status message when no response body", async () => {
        mock.onGet("/storetypes").reply(404);

        await expect(repo.get()).rejects.toEqual(new APIError("Error Code 404", "Not Found"));
    });

    it("should throw APIError with title and detail from response body", async () => {
        mock.onGet("/storetypes").reply(403, { title: "Forbidden", detail: "Graph is invalid" });

        await expect(repo.get()).rejects.toEqual(new APIError("Forbidden", "Graph is invalid"));
    });

    it("should throw unknown APIError when undefined status and body", async () => {
        mock.onGet("/storetypes").reply(0);

        await expect(repo.get()).rejects.toEqual(new APIError("Unknown Error", "Unable to make request"));
    });
});
