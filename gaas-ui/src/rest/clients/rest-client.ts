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
        return restClient.uriSpec(restClient);
         },
        post: () => { 
            restClient.method = "post";
            return restClient.requestBodySpec(restClient);
        },
        delete: () => { 
            restClient.method = "delete";
            return restClient.uriSpec(restClient);
        }
    })

    private requestBodySpec = (restClient: RestClient<any>) => ({
        requestBody: (requestBody?: T) => {
            restClient.data = requestBody;
            return restClient.uriSpec(restClient);
        }
    })

    private uriSpec = (restClient: RestClient<any>) => ({
        uri: (uri: string) => { 
            restClient.url = uri;
            return restClient.executeSpec(restClient);
         },
         graphs: (pathVariable?: string) => {
            const _pathVariable = pathVariable ? `/${pathVariable}` : "";
            restClient.url = `/graphs${_pathVariable}`;
            restClient.headers = { Authorization: "Bearer " + RestClient.jwtToken };
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
        namespaces: () =>  {
            restClient.url = "/namespaces";
            restClient.headers = { Authorization: "Bearer " + RestClient.jwtToken };
            return restClient.executeSpec(restClient);
        },
        authentication: (pathVariable?: string) => {
            const _pathVariable = pathVariable ? `/${pathVariable}` : "";
            restClient.url = `/auth${_pathVariable}`;
            return restClient.executeSpec(restClient);
        },
        storeTypes: () => {
            restClient.url="/storetypes"
            restClient.headers = { Authorization: "Bearer " + RestClient.jwtToken };
            return restClient.executeSpec(restClient);
        }
    })

    private executeSpec = (restClient: RestClient<any>) => ({
        execute: async () => {
            try {
                const response: AxiosResponse<any> = await axios({
                    baseURL: restClient.baseURL,
                    url: restClient.url,
                    method: restClient.method,
                    headers: restClient.headers,
                    data: restClient.data,
                });
                return RestClient.convert(response);
            } catch (e) {
                const error = e as AxiosError<any>;
                throw RestClient.fromError(error);
            }
        }
    })

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
