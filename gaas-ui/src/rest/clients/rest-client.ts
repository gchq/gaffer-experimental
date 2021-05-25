import axios, { AxiosError, AxiosResponse, Method } from "axios";
import status from "statuses";
import { GaaSRestApiErrorResponse } from "../http-message-interfaces/error-response-interface";
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
    
    public baseUrl(baseURL: string): RestClient<T> {
        this.url = baseURL;
        return this;
    }
    
    public get(): RestClient<T> {
        this.method = "get";
        return this;
    }
    
    public post(): RestClient<T> {
        this.method = "post";
        return this;
    }
    
    public delete(): RestClient<T> {
        this.method = "delete";
        return this;
    }

    public graphs(pathVariable?: string): RestClient<T> {
        const _pathVariable = pathVariable ? `/${pathVariable}` : "";
        this.url = `/graphs${_pathVariable}`;
        this.headers = { Authorization: "Bearer " + RestClient.jwtToken };
        return this;
    }

    public status(): RestClient<T>{
        this.url = "graph/status";
        return this;
    }

    public description(): RestClient<T>{
        this.url = "graph/config/description";
        return this;
    }

    public namespaces(): RestClient<T> {
        this.url = "/namespaces";
        this.headers = { Authorization: "Bearer " + RestClient.jwtToken };
        return this;
    }

    public authentication(pathVariable?: string): RestClient<T> {
        const _pathVariable = pathVariable ? `/${pathVariable}` : "";
        this.url = `/auth${_pathVariable}`;
        return this;
    }

    public requestBody(requestBody: T): RestClient<T> {
        this.data = requestBody;
        return this;
    }

    public async execute(): Promise<IApiResponse> {
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

    private static fromError(e: AxiosError<GaaSRestApiErrorResponse>): RestApiError {
        if (e.response && e.response.data) {
            return new RestApiError(e.response.data.title, e.response.data.detail);
        }
        if (e.response && e.response.status) {
            // @ts-ignore
            return new RestApiError(`Error Code ${e.response.status}`, status(e.response.status));
        }
        return new RestApiError("Unknown Error", "Unable to make request");
    }

    private static async convert(response: AxiosResponse<any>): Promise<IApiResponse> {
        return {
            status: response.status,
            data: response.data,
        };
    }
}
