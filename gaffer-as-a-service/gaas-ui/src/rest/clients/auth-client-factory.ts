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

import { Config } from "../config";
import { AuthApiClient } from "./auth-api-client";
import { IAuthClient } from "./authclient";
import { CognitoIdentityClient } from "./cognito-identity-client";

export class AuthClientFactory {
    private readonly platform = Config.REACT_APP_API_PLATFORM;

    public create(): IAuthClient {
        switch (this.platform) {
            case "AWS": {
                return new CognitoIdentityClient();
            }
            case "OPENSHIFT": {
                return new AuthApiClient();
            }
            default: {
                return new AuthApiClient();
            }
        }
    }
}
