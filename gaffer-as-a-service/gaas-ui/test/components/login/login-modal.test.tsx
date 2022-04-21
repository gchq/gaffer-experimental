/*
 * Copyright 2021-2022 Crown Copyright
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

import { Dialog } from "@material-ui/core";
import { mount, ReactWrapper } from "enzyme";
import React from "react";
import LoginModal from "../../../src/components/login/login-modal";
import { AuthApiClient } from "../../../src/rest/clients/auth-api-client";
import { Config } from "../../../src/rest/config";

jest.mock("../../../src/rest/clients/auth-api-client");

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
        component = mount(<LoginModal onLogin={usernameCallback} />);
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
            mockAuthApiClientLogin();

            inputUsername("testUsername");
            inputPassword("testPassword");

            clickSubmitSignIn();

            expect(usernameCallback).toHaveBeenCalledWith("testUsername");
        });
    });
    describe("Switch Login Form", () => {
        it("should render Reset Temp Password Login when switch form onclick is clicked", () => {
            clickNewUserSignIn();

            expect(component.find("main#old-password-login-form")).toHaveLength(1);
            expect(component.find("main#login-form")).toHaveLength(0);

            component.find("a#login-form-link").simulate("click");

            expect(component.find("main#old-password-login-form")).toHaveLength(0);
            expect(component.find("main#login-form")).toHaveLength(1);
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
describe("URL Sanitising in href tags", () => {
    beforeEach(() => {
        Config.REACT_APP_API_PLATFORM = "AWS";
        Config.REACT_APP_COGNITO_CLIENT_ID = "TestClientId";
        Config.REACT_APP_AUTH_ENDPOINT = "javascript:alert('XSS');";
        Config.REACT_APP_COGNITO_SCOPE = "TestScope";
        Config.REACT_APP_COGNITO_REDIRECT_URI = "http://localhost:3000/viewgraphs";
        component = mount(<LoginModal onLogin={usernameCallback} />);
    });
    it("should sanitize the URL in the href tag", () => {
        expect(component.find("main#login-options").length).toBe(1);
        const button = component.find("button#login-with-cognito-button");
        expect(button.props().href).toBe("");
    });
});
describe("Cognito", () => {
    beforeEach(() => {
        Config.REACT_APP_API_PLATFORM = "AWS";
        Config.REACT_APP_COGNITO_CLIENT_ID = "TestClientId";
        Config.REACT_APP_AUTH_ENDPOINT = "https://localhost:4000";
        Config.REACT_APP_COGNITO_SCOPE = "TestScope";
        Config.REACT_APP_COGNITO_REDIRECT_URI = "http://localhost:3000/viewgraphs";
        component = mount(<LoginModal onLogin={usernameCallback} />);
    });
    it("Should render the Login Options component", () => {
        expect(component.find("main#login-options").length).toBe(1);
    });

    describe("Login with Cognito", () => {
        it("should render the Login with Cognito Button", () => {
            const button = component.find("a#login-with-cognito-button");

            expect(button.length).toBe(1);
            expect(button.text()).toBe("Login with Cognito");
        });
        it("should have the REACT_APP_AUTH_ENDPOINT in the button href", () => {
            const button = component.find("a#login-with-cognito-button");

            expect(button.props().href).toBe(
                "https://localhost:4000/login?client_id=TestClientId&response_type=token&scope=TestScope&redirect_uri=http://localhost:3000/viewgraphs"
            );
        });
        it("should call back with Username when a User logs in with Cognito", async () => {
            window.location.hash =
                "#id_token=eyJraWQiOiI4bFdGbzRrXC9aNUZmcis1WlNST05IejVaZlVuRFwvZ3gzXC9RKytzVzFINlFvPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiaGtuYklxcGg0cnQxMmFJV2tOZWtmUSIsInN1YiI6ImNjNWZkZWU1LWFmZDgtNGM5MC1iY2M5LTZiZTk0M2RmOGI5MSIsImF1ZCI6IjM1aG11ZDB1ZGxxZmtjNGcwbnRhdXI2dDh2IiwiZXZlbnRfaWQiOiJiY2VmOTUwZC1kNzY1LTQ0NGYtYjdlNi03MTU1MTc3NmFlZjAiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTYzNjYzMTM4NCwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMi5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTJfV2ZnYXpDdFBRIiwiY29nbml0bzp1c2VybmFtZSI6InRlc3QtdXNlciIsImV4cCI6MTYzNjYzNDk4NCwiaWF0IjoxNjM2NjMxMzg0LCJqdGkiOiJkZjg5NWMzYi03Y2JhLTRiMjUtOTg3OS00NTlkYmVmYzliZTkiLCJlbWFpbCI6Im5peGlmOTAzMjlAY3lhZHAuY29tIn0.Bqoa8Bi_2_T1cv8Sus4IwOmvC5O_2zBcHkETBOK88qwJN8UJgEd7PM81tPv31F1j1dm5EgnmFxi66gPztICNUUlKC1fXZaqY39nMXGMmPaE8_yofUgGcFAzhWRpuwEqOKqVWCVtLCHc10UVvF0P2TYda_oie0HWh5lksyizZ87ga9Ja83Cp7ipZxrWpKInUsCoWrQvda7-k8q70GOvljQCnk9xupqSTMXetS9kwOjvImyA-BoFGntoe0P9EqSFLabZ34slD8qm3-lC6kPEd48iu4gGB4sYjGRq2_WljUzgO_84eR6nhQr-7vT1563MycvjrorWvZX7w47J3H4At5PQ";
            component = mount(<LoginModal onLogin={usernameCallback} />);
            expect(usernameCallback).toHaveBeenCalledWith("test-user");
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
    expect(component.find("input#username").length).toBe(1);
    component.find("input#username").simulate("change", {
        target: { value: username },
    });
}

function inputPassword(password: string): void {
    expect(component.find("input#password").length).toBe(1);
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

function mockAuthApiClientFailedLogOut(errorMessage: string) {
    // @ts-ignore
    AuthApiClient.prototype.signOut.mockImplementationOnce(
        (onSuccess: () => void, onError: (errorMessage: string) => void) => {
            onError(errorMessage);
        }
    );
}
