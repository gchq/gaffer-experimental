/*
 * Copyright 2022 Crown Copyright
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
import { APIError } from "../../../src/rest/APIError";
import { DeleteCollaboratorRepo } from "../../../src/rest/repositories/delete-collaborator-repo";

const mock = new MockAdapter(axios);
const repo = new DeleteCollaboratorRepo();

describe("Delete Graph Repo", () => {
    describe("On Success", () => {
        it("should resolve as successfully deleted when response status is 204", async () => {
            mock.onDelete("/deleteCollaborator/graph-1/myUser").reply(204);

            await expect(repo.delete("graph-1", "myUser")).resolves.toEqual(undefined);
        });
    });

    describe("On Error", () => {
        it("should throw APIError with correct 403 Error Code and Message when access denied", async () => {
            mock.onDelete("/deleteCollaborator/graph-1/myUser").reply(403);

            await expect(repo.delete("graph-1", "myUser")).rejects.toEqual(new APIError("Error Code 403", "Forbidden"));
        });
    });
});
