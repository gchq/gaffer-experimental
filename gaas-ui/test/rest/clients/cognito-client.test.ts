import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
import { CognitoClient } from "../../../src/rest/clients/cognito-client";
import { RestClient } from "../../../src/rest/clients/rest-client";

jest.mock("amazon-cognito-identity-js");
jest.mock("../../../src/rest/clients/rest-client");

const cognitoClient = new CognitoClient();

describe("Existing User Sign In", () => {
    it("should call onSuccess when login is successful", () => {
        mockSuccessfulAuthenticateUser("My-co6n1t0-t0k3n");

        const username = "John Smith";
        const password = "Password1";
        const onSuccess = jest.fn();
        const onError = jest.fn();

        cognitoClient.login(username, password, onSuccess, onError);

        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledTimes(0);
        expect(RestClient.setJwtToken).toHaveBeenLastCalledWith("My-co6n1t0-t0k3n");
    });
    it("should call onError with error message when login fails", () => {
        mockFailAuthenticateUser("Failed because of blahhh");

        const username = "John Smith";
        const password = "Password1";
        const onSuccess = jest.fn();
        const onError = jest.fn();

        cognitoClient.login(username, password, onSuccess, onError);

        expect(onSuccess).toHaveBeenCalledTimes(0);
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenLastCalledWith("Failed because of blahhh");
    });
});

describe("New User Sign In", () => {
    it("should call onSuccess when login is successful", () => {
        mockSuccessfulAuthenticateNewUser("My-co6n1t0-t0k3n");

        const onSuccess = jest.fn();
        const onError = jest.fn();

        cognitoClient.setNewPasswordAndLogin("John Smith", "P@$$word", "N3wPassw0rd", onSuccess, onError);

        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledTimes(0);
        expect(RestClient.setJwtToken).toHaveBeenLastCalledWith("My-co6n1t0-t0k3n");
    });
    it("should call onError with error message when login fails", () => {
        mockFailAuthenticateNewUser("Unable to set new password");

        const onSuccess = jest.fn();
        const onError = jest.fn();

        cognitoClient.setNewPasswordAndLogin("John Smith", "P@$$word", "N3wPassw0rd", onSuccess, onError);

        expect(onSuccess).toHaveBeenCalledTimes(0);
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenLastCalledWith("Unable to set new password");
    });
});

describe("Sign Out", () => {
    it("should call onSuccess when login is successful", () => {
        mockSuccessfulGlobalSignOut();

        const onSuccess = jest.fn();
        const onError = jest.fn();

        cognitoClient.signOut(onSuccess, onError);

        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledTimes(0);
    });
    it("should call onSuccess when login is successful", () => {
        mockFailedGlobalSignOut("Failed to sign out");

        const onSuccess = jest.fn();
        const onError = jest.fn();

        cognitoClient.signOut(onSuccess, onError);

        expect(onSuccess).toHaveBeenCalledTimes(0);
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenLastCalledWith("Failed to sign out");
    });
});

function mockSuccessfulAuthenticateUser(jwtToken: string) {
    const result = {
        getIdToken: () => ({
            getJwtToken: () => jwtToken,
        }),
    };
    // @ts-ignore
    CognitoUser.prototype.authenticateUser.mockImplementationOnce(
        (authDetails: AuthenticationDetails, callBacks: CognitoCallBacks) => {
            callBacks.onSuccess(result);
        }
    );
}

function mockFailAuthenticateUser(errorMessage: string) {
    // @ts-ignore
    CognitoUser.prototype.authenticateUser.mockImplementationOnce(
        (authDetails: AuthenticationDetails, callBacks: CognitoCallBacks) => {
            callBacks.onFailure({ message: errorMessage });
        }
    );
}

function mockSuccessfulAuthenticateNewUser(jwtToken: string) {
    const result = {
        getIdToken: () => ({
            getJwtToken: () => jwtToken,
        }),
    };
    // @ts-ignore
    CognitoUser.prototype.authenticateUser.mockImplementationOnce(
        (authDetails: AuthenticationDetails, callBacks: CognitoCallBacks) => {
            callBacks.onSuccess(result);
            callBacks.newPasswordRequired(jest.fn());
        }
    );
}

function mockFailAuthenticateNewUser(errorMessage: string) {
    // @ts-ignore
    CognitoUser.prototype.authenticateUser.mockImplementationOnce(
        (authDetails: AuthenticationDetails, callBacks: CognitoCallBacks) => {
            callBacks.onFailure({ message: errorMessage });
        }
    );
}

function mockSuccessfulGlobalSignOut() {
    // @ts-ignore
    CognitoUser.prototype.globalSignOut.mockImplementationOnce((callBacks: CognitoCallBacks) => {
        callBacks.onSuccess();
    });
}

function mockFailedGlobalSignOut(errorMessage: string) {
    // @ts-ignore
    CognitoUser.prototype.globalSignOut.mockImplementationOnce((callBacks: CognitoCallBacks) => {
        callBacks.onFailure({ message: errorMessage });
    });
}

interface CognitoCallBacks {
    onSuccess: (result?: any) => void;
    onFailure: (error: { message: string }) => void;
    newPasswordRequired: (userAttributes: any) => void;
}
