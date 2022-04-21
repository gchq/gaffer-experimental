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
import { IAuthClient } from "./authclient";
import { IApiResponse, RestClient } from "./rest-client";
import { GaaSRestApiErrorResponse } from "../http-message-interfaces/error-response-interface";

interface IAuthRequest {
    username: string;
    password: string;
}

export class AuthApiClient implements IAuthClient {
    public async login(username: string, password: string, onSuccess: Function, onError: Function): Promise<void> {
        try {
            const requestBody: IAuthRequest = {
                username: username,
                password: password,
            };
            const token: IApiResponse<string> = await new RestClient<IAuthRequest>()
                .baseUrl(Config.REACT_APP_AUTH_ENDPOINT)
                .post()
                .requestBody(requestBody)
                .authentication()
                .execute();
            RestClient.setJwtToken(token.data);
            onSuccess();
        } catch (e) {
            onError(e as GaaSRestApiErrorResponse);
        }
    }

    public async setNewPasswordAndLogin(
        username: string,
        tempPassword: string,
        newPassword: string,
        onSuccess: Function,
        onError: Function
    ): Promise<void> {
        try {
            const requestBody: IAuthRequest = {
                username: username,
                password: tempPassword,
            };
            const token: IApiResponse<string> = await new RestClient<IAuthRequest>()
                .baseUrl(Config.REACT_APP_AUTH_ENDPOINT)
                .post()
                .requestBody(requestBody)
                .authentication()
                .execute();
            RestClient.setJwtToken(token.data);
            onSuccess();
        } catch (e) {
            onError(e as GaaSRestApiErrorResponse);
        }
    }

    public async signOut(onSuccess: Function, onError: Function): Promise<void> {
        try {
            await new RestClient()
                .baseUrl(Config.REACT_APP_AUTH_ENDPOINT)
                .post()
                .requestBody("signout")
                .authentication()
                .execute();
            onSuccess();
        } catch (e) {
            onError(e as GaaSRestApiErrorResponse);
        }
    }
}
