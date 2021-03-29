import { Config } from "../config";
import { AuthApiClient } from "./auth-api-client";
import { IAuthClient } from "./authclient";
import { CognitoClient } from "./cognito-client";

export class AuthClientFactory {
    private readonly platform = Config.REACT_APP_API_PLATFORM;

    public create(): IAuthClient {
        switch (this.platform) {
            case "AWS": {
                return new CognitoClient();
            }
            case "OPENSHIFT": {
                return new AuthApiClient();
            }
            default: {
                return new AuthApiClient();
            }
        }
    }
}
