/*
 * Copyright 2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */

import { DeleteGraphRepo } from "../../../src/rest/repositories/delete-graph-repo";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { RestApiError } from "../../../src/rest/RestApiError";

const mock = new MockAdapter(axios);
const repo = new DeleteGraphRepo();

describe("Delete Graph Repo", () => {
    describe("On Success", () => {
        it("should resolve as successfully deleted when response status is 204", async () => {
            mock.onDelete("/graphs/graph-1").reply(204);

            await expect(repo.delete("graph-1")).resolves.toEqual(undefined);
        });
    });

    describe("On Error", () => {
        it("should throw RestApiError with correct 403 Error Code and Message when response body is empty", async () => {
            mock.onDelete("/graphs/graph-2").reply(403);

            await expect(repo.delete("graph-2")).rejects.toEqual(new RestApiError("Error Code 403", "Forbidden"));
        });

        it("should throw RestApiError with correct 500 Error Code and Message when response body is empty", async () => {
            mock.onDelete("/graphs/graph-2").reply(500);

            await expect(repo.delete("graph-2")).rejects.toEqual(
                new RestApiError("Error Code 500", "Internal Server Error")
            );
        });

        it("should throw RestApiError with title and detail from response body", async () => {
            mock.onDelete("/graphs/graph-2").reply(500, {
                title: "ServerError",
                detail: "There was a server error",
            });

            await expect(repo.delete("graph-2")).rejects.toEqual(
                new RestApiError("ServerError", "There was a server error")
            );
        });
        it("should throw Unknowen RestApiError when no status or response body", async () => {
            mock.onDelete("/graphs/graph-2").reply(0);

            await expect(repo.delete("graph-2")).rejects.toEqual(
                new RestApiError("Unknown Error", "Unable to make request")
            );
        });
    });
});
