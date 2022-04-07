import axios, { AxiosError, AxiosResponse } from "axios";
import { Config } from "../config";
import { RestClient } from "./rest-client";
import { RestApiError } from "../RestApiError";

export interface IWhatAuthInfo {
    requiredFields: Array<string>;
    requiredHeaders: object;
    attributes: object;
}

export class AuthSidecarClient {
    private static whatAuthObject: IWhatAuthInfo;
    private token: string;
    private whoami: object;
    public constructor() {
        this.token = "";
        this.whoami = {};
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
    public async getWhatAuth() {
        var response: AxiosResponse<any>;
        try {
            response = await axios({
                baseURL: Config.REACT_APP_AUTH_ENDPOINT,
                url: "/what-auth",
                method: "GET",
            });
        } catch (error) {
            throw RestClient.fromError(error as AxiosError<any>);
        }
        try {
            this.validateWhatAuthObject(response.data);
            AuthSidecarClient.whatAuthObject = response.data;
            return AuthSidecarClient.whatAuthObject;
        } catch (error) {
            throw error;
        }
    }
    private validateWhatAuthObject(data: object) {
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
    public async getWhoAmI() {
        try {
            const response: AxiosResponse<any> = await axios({
                baseURL: Config.REACT_APP_AUTH_ENDPOINT,
                url: "/whoami",
                method: "GET",
            });
            this.whoami = response.data;
            return response.data;
        } catch (error) {
            throw RestClient.fromError(error as AxiosError<any>);
        }
    }
    public async postAuth(data: object) {
        try {
            const response: AxiosResponse<any> = await axios({
                baseURL: Config.REACT_APP_AUTH_ENDPOINT,
                url: "/auth",
                method: "POST",
                data: data,
            });
            this.token = response.data;
            return response.data;
        } catch (error) {
            throw RestClient.fromError(error as AxiosError<any>);
        }
    }
}
