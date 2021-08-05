import { Config } from "../config";
import { IAuthClient } from "./authclient";
import { IApiResponse, RestClient } from "./rest-client";

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
            onError(e.message);
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
            onError(e.message);
        }
    }

    public async signOut(onSuccess: Function, onError: Function): Promise<void> {
        try {
            await new RestClient().baseUrl(Config.REACT_APP_AUTH_ENDPOINT).post().requestBody("signout").authentication().execute();
            onSuccess();
        } catch (e) {
            onError(e.message);
        }
    }
}
