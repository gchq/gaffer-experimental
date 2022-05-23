/*
 * Copyright 2021-2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { mount, ReactWrapper } from "enzyme";
import React from "react";
import LoginForm from "../../../src/components/login/login-form";
import { AuthApiClient } from "../../../src/rest/clients/auth-api-client";

jest.mock("../../../src/rest/clients/auth-api-client");

let component: ReactWrapper;
const onSuccessCallBack = jest.fn();
beforeAll(
    () =>
        (process.env = Object.assign(process.env, {
            REACT_APP_API_PLATFORM: "TEST",
        }))
);
beforeEach(() => (component = mount(<LoginForm onChangeForm={() => {}} onSuccess={onSuccessCallBack} />)));
afterEach(() => component.unmount());
afterAll(() => (process.env = Object.assign(process.env, { REACT_APP_API_PLATFORM: "" })));

describe("On Render", () => {
    it("should have a username input field", () => {
        const inputField = component.find("input#username");

        expect(inputField).toHaveLength(1);
    });
    it("should have a password input field", () => {
        const inputField = component.find("input#password");

        expect(inputField).toHaveLength(1);
    });
    it("should have a Sign Out button", () => {
        expect(component.find("button#submit-sign-in-button")).toHaveLength(1);
    });
});

describe("Sign in Button", () => {
    it("should be disabled when Username and Password fields are empty", () => {
        expect(component.find("button#submit-sign-in-button").props().disabled).toBe(true);
    });
    it("should be disabled when Username field is empty", () => {
        inputPassword("testPassword");

        expect(component.find("button#submit-sign-in-button").props().disabled).toBe(true);
    });
    it("should be disabled when Password field is empty", () => {
        inputUsername("testUsername");

        expect(component.find("button#submit-sign-in-button").props().disabled).toBe(true);
    });
    it("should be enabled when Username and Password is inputted", () => {
        inputUsername("testUsername");
        inputPassword("testPassword");

        expect(component.find("button#submit-sign-in-button").props().disabled).toBe(false);
    });
    it("should call onSuccess callback with Username when successfully logged in", async () => {
        mockAuthApiClientLogin();

        inputUsername("JoVibin");
        inputPassword("testPassword");
        clickSubmitSignIn();

        expect(onSuccessCallBack).toHaveBeenCalledTimes(1);
        expect(onSuccessCallBack).toHaveBeenCalledWith("JoVibin");
    });
    it("should display error message when sign in fails", () => {
        mockAuthApiClientNewUserLoginWithError("My login failed");

        inputUsername("testUsername");
        inputPassword("testTempPassword");
        clickSubmitSignIn();

        expect(component.find("div#notification-alert").text()).toBe("Login failed: My login failed");
    });
});

function inputUsername(username: string): void {
    component.find("input#username").simulate("change", {
        target: { value: username },
    });
    expect(component.find("input#username").length).toBe(1);
}

function inputPassword(password: string): void {
    component.find("input#password").simulate("change", {
        target: { value: password },
    });
    expect(component.find("input#password").length).toBe(1);
}

function clickSubmitSignIn() {
    component.find("button#submit-sign-in-button").simulate("click");
}

function mockAuthApiClientLogin() {
    // @ts-ignore
    AuthApiClient.prototype.login.mockImplementationOnce(
        (username: string, password: string, onSuccess: () => void, onError: () => void) => {
            onSuccess();
        }
    );
}

function mockAuthApiClientNewUserLoginWithError(errorMessage: string) {
    // @ts-ignore
    AuthApiClient.prototype.login.mockImplementationOnce(
        (username: string, password: string, onSuccess: () => void, onError: (errorMessage: string) => void) => {
            onError(errorMessage);
        }
    );
}
