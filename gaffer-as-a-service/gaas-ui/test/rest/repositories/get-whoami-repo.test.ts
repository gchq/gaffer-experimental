/*
 * Copyright 2021-2022 Crown Copyright
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

import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { GetWhoAmIRepo } from "../../../src/rest/repositories/get-whoami-repo";
import { RestApiError } from "../../../src/rest/RestApiError";

const mock = new MockAdapter(axios);
const getWhoAmIRepo = new GetWhoAmIRepo();
describe("GetWhoAmIRepo", () => {
    it("Should return an email string when request is successful", async () => {
        const apiResponse: string = "test@test.com";
        mock.onGet("/whoami").reply(200, apiResponse);
        const actualResponse = await getWhoAmIRepo.getWhoAmI();
        expect(actualResponse).toEqual("test@test.com");
    });
    it("should throw RestApiError when 404 and have correct error message when no response body returned", async () => {
        mock.onGet("/whoami").reply(404);

        await expect(getWhoAmIRepo.getWhoAmI()).rejects.toEqual(new RestApiError("Error Code 404", "Not Found"));
    });
});
