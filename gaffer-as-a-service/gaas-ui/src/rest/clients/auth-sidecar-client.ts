import axios, { AxiosError, AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from "axios";
import { Config } from "../config";
import { RestClient } from "./rest-client";

export interface IWhatAuthInfo {
    requiredFields: Array<string>;
    requiredHeaders: object;
    attributes: object;
}

export class AuthSidecarClient {
    private static whatAuthObject: IWhatAuthInfo = {
        requiredFields: [],
        requiredHeaders: {},
        attributes: {},
    };
    private static token: string = "";
    private whoami: string;
    public constructor() {
        this.whoami = "";
    }
    private static setToken(token: string) {
        this.token = token;
    }
    public static getRequiredHeaders(): object {
        return this.whatAuthObject.requiredHeaders;
    }
    public static getRequiredFields(): Array<string> {
        return this.whatAuthObject.requiredFields;
    }
    public static getAttributes(): object {
        return this.whatAuthObject.attributes;
    }
    public static getToken(): string {
        return this.token;
    }
    public static resetAuthSidecarClient() {
        AuthSidecarClient.setToken("");
    }
    public async getWhatAuth(): Promise<IWhatAuthInfo> {
        let response: AxiosResponse;
        try {
            response = await axios({
                baseURL: Config.REACT_APP_AUTH_ENDPOINT,
                url: "/what-auth",
                method: "GET",
            });
        } catch (error) {
            throw RestClient.fromError(error as AxiosError);
        }
        try {
            AuthSidecarClient.validateWhatAuthObject(response.data);
            AuthSidecarClient.whatAuthObject = response.data;
            return AuthSidecarClient.whatAuthObject;
        } catch (error) {
            throw new Error(error as string);
        }
    }
    private static validateWhatAuthObject(data: object) {
        const requiredAttributes: string = ["attributes", "requiredFields", "requiredHeaders"].sort().toString();
        const objectKeys: string = Object.keys(data).sort().toString();
        if (objectKeys === requiredAttributes) {
            for (const [key, value] of Object.entries(data)) {
                if (
                    (key === "attributes" && typeof value !== "object") ||
                    (key === "requiredFields" && !Array.isArray(value)) ||
                    (key === "requiredHeaders" && typeof value !== "object")
                ) {
                    throw new Error("Invalid Response").message;
                }
            }
        } else {
            throw new Error("Invalid Response").message;
        }
    }

    private static convertMapToJson(map: Map<string, string>): object {
        return Object.fromEntries(map);
    }
    public async getWhoAmI(): Promise<string> {
        const config: AxiosRequestConfig = {
            baseURL: Config.REACT_APP_AUTH_ENDPOINT,
            url: "/whoami",
            method: "GET",
            headers: AuthSidecarClient.setHeaders(),
        };
        const updatedConfig = AuthSidecarClient.addAttributes(config);
        try {
            const response: AxiosResponse = await axios(updatedConfig);
            this.whoami = response.data;
            return response.data;
        } catch (error) {
            throw new Error(error as string);
        }
    }
    public async postAuth(data: Map<string, string>) {
        const config: AxiosRequestConfig = {
            baseURL: Config.REACT_APP_AUTH_ENDPOINT,
            url: "/auth",
            method: "POST",
            data: AuthSidecarClient.convertMapToJson(data),
        };
        const updatedConfig = AuthSidecarClient.addAttributes(config);
        try {
            const response: AxiosResponse = await axios(updatedConfig);
            AuthSidecarClient.setToken(response.data);
        } catch (error) {
            throw new Error(error as string);
        }
    }
    public static setHeaders(): AxiosRequestHeaders {
        const headersToAdd: AxiosRequestHeaders = {};
        const headers = AuthSidecarClient.getRequiredHeaders();
        Object.entries(headers).forEach(([key, value]) => {
            if (key === "Authorization") {
                headersToAdd[key] = value + " " + AuthSidecarClient.getToken();
            } else {
                headersToAdd[key] = value;
            }
        });
        return headersToAdd;
    }
    public static addAttributes(config: AxiosRequestConfig): AxiosRequestConfig {
        const attributes = AuthSidecarClient.getAttributes() as AxiosRequestConfig;
        return Object.assign(config, attributes);
    }
}
