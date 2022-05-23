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

import { AuthApiClient } from "../../../src/rest/clients/auth-api-client";
import { AuthClientFactory } from "../../../src/rest/clients/auth-client-factory";
import { IAuthClient } from "../../../src/rest/clients/authclient";
import { CognitoIdentityClient } from "../../../src/rest/clients/cognito-identity-client";
import { Config } from "../../../src/rest/config";

describe("Auth Factory", () => {
    afterEach(() => (process.env = Object.assign(process.env, { REACT_APP_API_PLATFORM: "" })));
    it("should return CognitoIdentityClient when REACT_APP_API_PLATFORM ENV is OPENSHIFT", () => {
        Config.REACT_APP_API_PLATFORM = "OPENSHIFT";

        const client: IAuthClient = new AuthClientFactory().create();

        expect(client).toBeInstanceOf(AuthApiClient);
    });
    it("should return CognitoIdentityClient when REACT_APP_API_PLATFORM ENV is AWS", () => {
        Config.REACT_APP_API_PLATFORM = "AWS";

        const client: IAuthClient = new AuthClientFactory().create();

        expect(client).toBeInstanceOf(CognitoIdentityClient);
    });
    it("should return by default AuthApiClient when REACT_APP_API_PLATFORM ENV is not a defined type", () => {
        Config.REACT_APP_API_PLATFORM = undefined;

        const client: IAuthClient = new AuthClientFactory().create();

        expect(client).toBeInstanceOf(AuthApiClient);
    });
});
