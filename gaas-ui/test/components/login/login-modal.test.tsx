import { Dialog } from "@material-ui/core";
import { mount, ReactWrapper } from "enzyme";
import React from "react";
import LoginModal from "../../../src/components/login/login-modal";
import { AuthApiClient } from "../../../src/rest/clients/auth-api-client";
import { AuthSidecarClient } from "../../../src/rest/clients/auth-sidecar-client";
import { Config } from "../../../src/rest/config";

jest.mock("../../../src/rest/clients/auth-api-client");
jest.mock("../../../src/rest/clients/auth-sidecar-client");

let component: ReactWrapper;
const jestMock = jest.fn();
const usernameCallback = jest.fn();
afterEach(() => {
    component.unmount();
    jestMock.mockReset();
    Config.REACT_APP_API_PLATFORM = "";
    Config.REACT_APP_COGNITO_USERPOOL_ID = "";
    Config.REACT_APP_COGNITO_CLIENT_ID = "";
    Config.REACT_APP_AUTH_ENDPOINT = "";
    Config.REACT_APP_COGNITO_SCOPE = "";
    Config.REACT_APP_COGNITO_REDIRECT_URI = "";
});

describe("Login form", () => {
    beforeEach(() => {
        component = mount(
            <LoginModal onLogin={usernameCallback} requiredFields={["username", "password"]} showLoginForm={true} />
        );
        Config.REACT_APP_API_PLATFORM = "OTHER";
    });
    describe("Login Form UI", () => {
        it("should render Login form as full screen modal", () => {
            expect(component.find("main#login-form").length).toBe(1);
        });
        it("should render Sign Out Button", () => {
            const signOutButton = component.find("button#sign-out-button");

            expect(signOutButton.length).toBe(1);
            expect(signOutButton.text()).toBe("Sign out");
        });
    });
    describe("onLogin call back", () => {
        it("should call back with Username when a User logs in", () => {
            const expectedMap = new Map<String, String>();
            expectedMap.set("username", "testUsername");
            expectedMap.set("password", "testPassword");
            mockPostAuth(expectedMap);

            inputUsername("testUsername");
            inputPassword("testPassword");

            clickSubmitSignIn();

            expect(mockPostAuth).toHaveBeenCalledWith(expectedMap);
        });
    });
    describe("Sign Out Outcomes", () => {
        it("should show modal with error message when sign out fails", () => {
            mockAuthApiClientLogin();
            mockAuthApiClientFailedLogOut("Sign out was a failure");

            inputUsername("testUsername");
            inputPassword("testPassword");
            clickSubmitSignIn();

            clickSignOutButton();

            expect(component.find(Dialog).at(1).text()).toBe("Sign out was a failure");
        });
    });
});

function clickSubmitSignIn() {
    component.find("button#submit-sign-in-button").simulate("click");
}

function clickSignOutButton() {
    component.find("button#sign-out-button").simulate("click");
}

function clickNewUserSignIn() {
    component.find("a#temp-password-form-link").simulate("click");
}

function inputUsername(username: string): void {
    console.log(component.find("main#login-form").html());
    expect(component.find("main#login-form").find("input#username").length).toBe(1);
    component.find("input#username").simulate("change", {
        target: { value: username },
    });
}

function inputPassword(password: string): void {
    expect(component.find("main#login-form").find("input#password").length).toBe(1);
    component.find("input#password").simulate("change", {
        target: { value: password },
    });
}

function mockAuthApiClientLogin() {
    // @ts-ignore
    AuthApiClient.prototype.login.mockImplementationOnce(
        (username: string, password: string, onSuccess: () => void, onError: () => void) => {
            onSuccess();
        }
    );
}

async function mockPostAuth(data: Map<String, String>) {
    // @ts-ignore
    AuthSidecarClient.mockImplementationOnce(() => ({
        postAuth: jest.fn(),
    }));
}

function mockAuthApiClientFailedLogOut(errorMessage: string) {
    // @ts-ignore
    AuthApiClient.prototype.signOut.mockImplementationOnce(
        (onSuccess: () => void, onError: (errorMessage: string) => void) => {
            onError(errorMessage);
        }
    );
}
