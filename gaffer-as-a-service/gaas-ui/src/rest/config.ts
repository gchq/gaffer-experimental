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

const _env = window as any;

export class Config {
    static REACT_APP_API_PLATFORM = _env.REACT_APP_API_PLATFORM ?? process.env.REACT_APP_API_PLATFORM;
    static REACT_APP_KAI_REST_API_HOST = _env.REACT_APP_KAI_REST_API_HOST ?? process.env.REACT_APP_KAI_REST_API_HOST;
    static REACT_APP_COGNITO_USERPOOL_ID =
        _env.REACT_APP_COGNITO_USERPOOLID ?? process.env.REACT_APP_COGNITO_USERPOOLID;
    static REACT_APP_COGNITO_CLIENT_ID = _env.REACT_APP_COGNITO_CLIENTID ?? process.env.REACT_APP_COGNITO_CLIENTID;
    static REACT_APP_AUTH_ENDPOINT = _env.REACT_APP_AUTH_ENDPOINT ?? process.env.REACT_APP_AUTH_ENDPOINT;
    static REACT_APP_COGNITO_SCOPE = _env.REACT_APP_COGNITO_SCOPE ?? process.env.REACT_APP_COGNITO_SCOPE;
    static REACT_APP_COGNITO_REDIRECT_URI =
        _env.REACT_APP_COGNITO_REDIRECT_URI ?? process.env.REACT_APP_COGNITO_REDIRECT_URI;
}
