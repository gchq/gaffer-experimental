import axios, { AxiosError, AxiosResponse, Method } from "axios";
import status from "statuses";
import { GaaSRestApiErrorResponse } from "../http-message-interfaces/error-response-interface";
import { RestApiError } from "../RestApiError";
import { Config } from "./../config";

export interface IApiResponse<T = any> {
    status: number;
    data: T;
}

export class RestClient<T> {
    private static jwtToken: string;

    public static setJwtToken(jwtToken: string) {
        this.jwtToken = jwtToken;
    }

    private url: string;
    private method: Method;
    private headers: object;
    private data: T | undefined;
    constructor() {
        this.url = "";
        this.method = "get";
        this.headers = {};
        this.data = undefined;
    }

    public get(): RestClient<T> {
        this.method = "get";
        return this;
    }

    public graphs(pathVariable?: string): RestClient<T> {
        const _pathVariable = pathVariable ? `/${pathVariable}` : "";
        this.url = `/graphs${_pathVariable}`;
        this.headers = { Authorization: "Bearer " + RestClient.jwtToken };
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

    public post(): RestClient<T> {
        this.method = "post";
        return this;
    }

    public delete(): RestClient<T> {
        this.method = "delete";
        return this;
    }

    public requestBody(requestBody: T): RestClient<T> {
        this.data = requestBody;
        return this;
    }

    public async execute(): Promise<IApiResponse> {
        try {
            const response: AxiosResponse<any> = await axios({
                url: this.url,
                method: this.method,
                baseURL: Config.REACT_APP_KAI_REST_API_HOST,
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
