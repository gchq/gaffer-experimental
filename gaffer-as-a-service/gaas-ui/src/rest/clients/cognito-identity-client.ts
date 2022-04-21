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

import { AuthenticationDetails, CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";
import { IAuthClient } from "./authclient";
import { poolData } from "./cognito-config";
import { RestClient } from "./rest-client";
import { Config } from "../config";

export class CognitoIdentityClient implements IAuthClient {
    private static cognitoUser: CognitoUser;
    private static authenticationDetails: AuthenticationDetails;

    public static buildCognitoLoginURL(): string {
        return (
            Config.REACT_APP_AUTH_ENDPOINT +
            "/login" +
            "?client_id=" +
            Config.REACT_APP_COGNITO_CLIENT_ID +
            "&response_type=token" +
            "&scope=" +
            Config.REACT_APP_COGNITO_SCOPE +
            "&redirect_uri=" +
            Config.REACT_APP_COGNITO_REDIRECT_URI
        );
    }

    public static buildCognitoLogoutURL(): string {
        return (
            Config.REACT_APP_AUTH_ENDPOINT +
            "/logout" +
            "?client_id=" +
            Config.REACT_APP_COGNITO_CLIENT_ID +
            "&logout_uri=" +
            Config.REACT_APP_COGNITO_REDIRECT_URI
        );
    }

    public login(username: string, password: string, onSuccess: Function, onError: Function) {
        CognitoIdentityClient.initCognitoUser(username, password);

        CognitoIdentityClient.cognitoUser.authenticateUser(CognitoIdentityClient.authenticationDetails, {
            onSuccess: function (result) {
                // Use the idToken for Logins Map when Federating User Pools with identity pools or when
                // passing through an Authorization Header to an API Gateway Authorizer
                const idToken = result.getIdToken().getJwtToken();
                RestClient.setJwtToken(idToken);
                onSuccess();
            },

            onFailure: function (error) {
                onError(error.message);
            },
        });
    }

    public setNewPasswordAndLogin(
        username: string,
        tempPassword: string,
        newPassword: string,
        onSuccess: Function,
        onError: Function
    ) {
        CognitoIdentityClient.initCognitoUser(username, tempPassword);

        CognitoIdentityClient.cognitoUser.authenticateUser(CognitoIdentityClient.authenticationDetails, {
            newPasswordRequired: function (userAttributes) {
                // User was signed up by an admin and must provide new password and required attributes,
                // if any, to complete authentication.
                // The api doesn't accept email_verified field back
                delete userAttributes.email_verified;

                // Get these details and call
                CognitoIdentityClient.cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);
            },

            onSuccess: function (result) {
                // Use the idToken for Logins Map when Federating User Pools with identity pools or when
                // passing through an Authorization Header to an API Gateway Authorizer
                const idToken = result.getIdToken().getJwtToken();
                RestClient.setJwtToken(idToken);
                onSuccess();
            },

            onFailure: function (error) {
                onError(error.message);
            },
        });
    }

    private static initCognitoUser(username: string, password: string) {
        const authenticationData = {
            Username: username,
            Password: password,
        };
        this.authenticationDetails = new AuthenticationDetails(authenticationData);

        const userPool = new CognitoUserPool(poolData);
        const userData = {
            Username: username,
            Pool: userPool,
        };
        this.cognitoUser = new CognitoUser(userData);
    }

    public signOut(onSuccess: Function, onError: Function) {
        CognitoIdentityClient.cognitoUser.globalSignOut({
            onSuccess: function () {
                onSuccess();
            },
            onFailure: function (err) {
                onError(err.message);
            },
        });
    }
}
