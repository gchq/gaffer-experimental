import axios, { AxiosError, AxiosResponse, Method } from "axios";
import status from "statuses";
import { RestApiError } from "../RestApiError";

export interface IApiResponse<T = any> {
    status: number;
    data: T;
}

export class RestClient<T> {
    private static jwtToken: string;

    public static setJwtToken(jwtToken: string) {
        this.jwtToken = jwtToken;
    }

    private baseURL: string;
    private url: string;
    private method: Method;
    private headers: object;
    private data: T | undefined;
    constructor() {
        this.baseURL = "";
        this.url = "";
        this.method = "get";
        this.headers = {};
        this.data = undefined;        
    }
    
    public create():any {
        return this.methodSpec(this);
    }
    
    public baseUrl(baseURL: string) {
        this.baseURL = baseURL;
        return this.methodSpec(this);
    }

    private methodSpec = (restClient: RestClient<any>) => ({
        get: () => { 
        restClient.method = "get";
        return restClient.uriSpec;
         },
        post: () => { 
            restClient.method = "post";
            return restClient.requestBodySpec;
        },
        delete: () => { 
            restClient.method = "delete";
            return restClient.uriSpec;
        }
    })

    private requestBodySpec = {
        requestBody: (requestBody?: T) => {
            this.data = requestBody;
            return this.uriSpec;
        }
    }

    private uriSpec = {
        uri: (uri: string) => { 
            this.url = uri;
            return this.executeSpec;
         },
         graphs: (pathVariable?: string) => {
            const _pathVariable = pathVariable ? `/${pathVariable}` : "";
            this.url = `/graphs${_pathVariable}`;
            this.headers = { Authorization: "Bearer " + RestClient.jwtToken };
            return this.executeSpec;
        },
        status: () => {
            this.url = "/graph/status";
            return this.executeSpec;
        },
        description: () => {
            this.url = "/graph/config/description";
            return this.executeSpec;
        },
        graphId: () => {
            this.url = "/graph/config/graphId";
            return this.executeSpec;
        },
        namespaces: () =>  {
            this.url = "/namespaces";
            this.headers = { Authorization: "Bearer " + RestClient.jwtToken };
            return this.executeSpec;
        },
        authentication: (pathVariable?: string) => {
            const _pathVariable = pathVariable ? `/${pathVariable}` : "";
            this.url = `/auth${_pathVariable}`;
            return this.executeSpec;
        },
        storeTypes: () => {
            this.url="/storetypes"
            this.headers = { Authorization: "Bearer " + RestClient.jwtToken };
            return this.executeSpec;
        }
    }

    private executeSpec = {
        execute: async () => {
            try {
                const response: AxiosResponse<any> = await axios({
                    baseURL: this.baseURL,
                    url: this.url,
                    method: this.method,
                    headers: this.headers,
                    data: this.data,
                });
                return RestClient.convert(response);
            } catch (e) {
                throw RestClient.fromError(e);
            }
        }
    }

    private static async convert(response: AxiosResponse<any>): Promise<IApiResponse> {
        return {
            status: response.status,
            data: response.data,
        };
    }

    private static fromError(e: AxiosError<any>): RestApiError {
        if (e.response && RestClient.isInstanceOfGafferApiErrorResponseBody(e.response.data)) { 
            return new RestApiError(e.response.data.status, e.response.data.simpleMessage);
        }
        if (e.response && e.response.data) {
            return new RestApiError(e.response.data.title, e.response.data.detail);
        }
        if (e.response && e.response.status) {
            // @ts-ignore
            return new RestApiError(`Error Code ${e.response.status}`, status(e.response.status));
        }
        return new RestApiError("Unknown Error", "Unable to make request");
    }

    private static isInstanceOfGafferApiErrorResponseBody(responseBody: object) {
        return responseBody && responseBody.hasOwnProperty("status") && responseBody.hasOwnProperty("simpleMessage");
    }
}
