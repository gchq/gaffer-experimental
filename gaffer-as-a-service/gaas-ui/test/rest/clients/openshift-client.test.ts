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

import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { OpenshiftClient } from "../../../src/rest/clients/openshift-client";

const mock = new MockAdapter(axios);
describe("RestClient whoami responses", () => {
    afterAll(() => mock.resetHandlers());
    it("should return a 200 status and response when GET is successful", async () => {
        mock.onGet("/whoami").reply(200, "test@test.com");
        const actual = await new OpenshiftClient().getWhoAmI();

        expect(actual).toEqual("test@test.com");
    });
    it("should throw 404 Error Message when api returns 404", async () => {
        mock.onGet("/whoami").reply(404, {
            title: "Not Found",
            detail: "User Email not found",
        });
        try {
            await new OpenshiftClient().getWhoAmI();
        } catch (e) {
            expect(e).toEqual({ detail: "User Email not found", title: "Not Found" });
        }
    });
});
