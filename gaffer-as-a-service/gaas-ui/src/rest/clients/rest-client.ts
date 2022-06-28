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
import axios, { AxiosError, AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse, Method } from "axios";
import status from "statuses";
import { APIError } from "../APIError";
import { AuthSidecarClient } from "./auth-sidecar-client";

export interface IApiResponse<T = any> {
    status: number;
    data: T;
}

export class RestClient<T> {
    private static jwtToken: string;
    private static email: string;

    public static setJwtToken(jwtToken: string) {
        this.jwtToken = jwtToken;
    }

    public static setEmail(email: string) {
        this.email = email;
    }

    private baseURL: string;
    private url: string;
    private method: Method;
    private headers: AxiosRequestHeaders;
    private data: T | undefined;

    constructor() {
        this.baseURL = "";
        this.url = "";
        this.method = "get";
        this.headers = {};
        this.data = undefined;
    }

    public create(): any {
        return this.methodSpec(this);
    }

    public addCollaborator(): any {
        return this.methodSpec(this);
    }

    public viewCollaborator(): any {
        return this.methodSpec(this);
    }

    public baseUrl(baseURL: string): any {
        this.baseURL = baseURL;
        return this.methodSpec(this);
    }

    private methodSpec = (restClient: RestClient<any>) => ({
        get: () => {
            restClient.method = "get";
            return restClient.uriSpec(restClient);
        },
        post: () => {
            restClient.method = "post";
            return restClient.requestBodySpec(restClient);
        },
        delete: () => {
            restClient.method = "delete";
            return restClient.uriSpec(restClient);
        },
    });

    private requestBodySpec = (restClient: RestClient<any>) => ({
        requestBody: (requestBody?: T) => {
            restClient.data = requestBody;
            return restClient.uriSpec(restClient);
        },
    });

    private uriSpec = (restClient: RestClient<any>) => ({
        uri: (uri: string) => {
            restClient.url = uri;
            return restClient.executeSpec(restClient);
        },
        graphs: (pathVariable?: string) => {
            const _pathVariable = pathVariable ? `/${pathVariable}` : "";
            restClient.url = `/graphs${_pathVariable}`;
            restClient.headers = AuthSidecarClient.setHeaders();
            return restClient.executeSpec(restClient);
        },
        status: () => {
            restClient.url = "/graph/status";
            return restClient.executeSpec(restClient);
        },
        description: () => {
            restClient.url = "/graph/config/description";
            return restClient.executeSpec(restClient);
        },
        graphId: () => {
            restClient.url = "/graph/config/graphId";
            return restClient.executeSpec(restClient);
        },
        namespaces: () => {
            restClient.url = "/namespaces";
            restClient.headers = AuthSidecarClient.setHeaders();
            return restClient.executeSpec(restClient);
        },
        authentication: (pathVariable?: string) => {
            const _pathVariable = pathVariable ? `/${pathVariable}` : "";
            restClient.url = `/auth${_pathVariable}`;
            return restClient.executeSpec(restClient);
        },
        storeTypes: () => {
            restClient.url = "/storetypes";
            restClient.headers = AuthSidecarClient.setHeaders();
            return restClient.executeSpec(restClient);
        },
        addCollaborator: () => {
            restClient.url = "/addCollaborator";
            restClient.headers = AuthSidecarClient.setHeaders();
            return restClient.executeSpec(restClient);
        },
        viewCollaborator: (pathVariable?: string) => {
            const _pathVariable = pathVariable ? `/${pathVariable}` : "";
            restClient.url = `/collaborators${_pathVariable}`;
            restClient.headers = AuthSidecarClient.setHeaders();
            return restClient.executeSpec(restClient);
        },
        deleteCollaborator: (graphPathVariable?: string, collaboratorPathVariable?: string) => {
            const _graphPathVariable = graphPathVariable ? `/${graphPathVariable}` : "";
            const _collaboratorPathVariable = collaboratorPathVariable ? `/${collaboratorPathVariable}` : "";
            restClient.url = `/deleteCollaborator${_graphPathVariable}${_collaboratorPathVariable}`;
            restClient.headers = AuthSidecarClient.setHeaders();
            return restClient.executeSpec(restClient);
        },
    });

    private executeSpec = (restClient: RestClient<any>) => ({
        execute: async () => {
            const config: AxiosRequestConfig = {
                baseURL: restClient.baseURL,
                url: restClient.url,
                method: restClient.method,
                headers: restClient.headers,
                data: restClient.data,
            };
            const updatedConfig = AuthSidecarClient.addAttributes(config);
            try {
                const response: AxiosResponse = await axios(updatedConfig);
                return RestClient.convert(response);
            } catch (e) {
                const error = e as AxiosError;
                throw RestClient.fromError(error);
            }
        },
    });

    private static async convert(response: AxiosResponse): Promise<IApiResponse> {
        return {
            status: response.status,
            data: response.data,
        };
    }

    public static fromError(e: AxiosError): APIError {
        if (e.response && RestClient.isInstanceOfGafferApiErrorResponseBody(e.response.data)) {
            return new APIError(e.response.data.status, e.response.data.simpleMessage);
        }
        if (e.response && e.response.data) {
            return new APIError(e.response.data.title, e.response.data.detail);
        }
        if (e.response && e.response.status) {
            // @ts-ignore
            return new APIError(`Error Code ${e.response.status}`, status(e.response.status));
        }
        return new APIError("Unknown Error", "Unable to make request");
    }

    private static isInstanceOfGafferApiErrorResponseBody(responseBody: object) {
        return responseBody && responseBody.hasOwnProperty("status") && responseBody.hasOwnProperty("simpleMessage");
    }
}
