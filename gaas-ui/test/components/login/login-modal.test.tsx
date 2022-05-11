import { mount, ReactWrapper } from "enzyme";
import React from "react";
import LoginModal from "../../../src/components/login/login-modal";
import { AuthApiClient } from "../../../src/rest/clients/auth-api-client";
import { AuthSidecarClient } from "../../../src/rest/clients/auth-sidecar-client";

import { act } from "react-dom/test-utils";
import { APIError } from "../../../src/rest/APIError";

jest.mock("../../../src/rest/clients/auth-api-client");
jest.mock("../../../src/rest/clients/auth-sidecar-client");

let component: ReactWrapper;
const jestMock = jest.fn();
const onLoginCallback = jest.fn();
afterEach(() => {
    component.unmount();
    jestMock.mockReset();
});

describe("Login form", () => {
    beforeEach(() => {
        component = mount(<LoginModal onLogin={onLoginCallback} requiredFields={["username", "password"]} />);
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
        it("should call onLoginCallback when the user successfully logs in", async () => {
            const expectedMap = new Map<string, string>();
            expectedMap.set("username", "testUsername");
            expectedMap.set("password", "testPassword");
            await mockPostAuth(expectedMap);
            jest.spyOn(AuthSidecarClient, "getToken").mockImplementation(() => "aValidJsonToken");
            await act(async () => {
                await inputUsername("testUsername");
                await inputPassword("testPassword");

                await clickSubmitSignIn();
            });

            expect(onLoginCallback).toHaveBeenCalled();
        });
        it("should display an error when login fails", async () => {
            await mockPostAuthToThrow(() => {
                throw new APIError("Server Error", "Timeout exception");
            });

            await inputUsername("testUsername");
            await inputPassword("testPassword");

            await clickSubmitSignIn();

            expect(component.find("div#notification-alert").text()).toBe(
                "Login failed: Server Error: Timeout exception"
            );
        });
    });
});

async function clickSubmitSignIn() {
    component.find("main#login-form").find("button#submit-sign-in-button").simulate("click");
}

async function inputUsername(username: string) {
    expect(component.find("main#login-form").find("input#username").length).toBe(1);
    component.find("input#username").simulate("change", {
        target: { value: username },
    });
}

async function inputPassword(password: string) {
    expect(component.find("main#login-form").find("input#password").length).toBe(1);
    component.find("input#password").simulate("change", {
        target: { value: password },
    });
}

async function mockPostAuth(data: Map<string, string>) {
    // @ts-ignore
    AuthSidecarClient.mockImplementationOnce(() => ({
        postAuth: () =>
            new Promise((resolve, reject) => {
                resolve(data);
            }),
    }));
}
async function mockPostAuthToThrow(f: () => void) {
    // @ts-ignore
    AuthSidecarClient.mockImplementationOnce(() => ({
        postAuth: f,
    }));
}
