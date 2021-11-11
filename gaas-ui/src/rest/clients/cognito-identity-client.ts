import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import { IAuthClient } from './authclient';
import { poolData } from './cognito-config';
import { RestClient } from './rest-client';

export class CognitoIdentityClient implements IAuthClient {
    private static cognitoUser: CognitoUser;
    private static authenticationDetails: AuthenticationDetails;

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
