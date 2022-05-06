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
import NavigationAppbar from "../../../src/components/navigation-bar/navigation-appbar";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthApiClient } from "../../../src/rest/clients/auth-api-client";
import { Config } from "../../../src/rest/config";
import { act } from "@testing-library/react";
import { OpenshiftClient } from "../../../src/rest/clients/openshift-client";
import { APIError } from "../../../src/rest/APIError";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

jest.mock("../../../src/rest/clients/auth-api-client");
jest.mock("../../../src/rest/clients/openshift-client");

let component: ReactWrapper;
const mock = new MockAdapter(axios);

beforeEach(() => {
    component = mount(
        <MemoryRouter>
            <NavigationAppbar />
        </MemoryRouter>
    );
});
afterEach(() => {
    component.unmount();
    jest.resetAllMocks();
});
afterAll(() => {
    process.env = Object.assign(process.env, { REACT_APP_API_PLATFORM: "" });
    Config.REACT_APP_API_PLATFORM = "";
    mock.resetHandlers();
});

describe("Navigation Appbar Component", () => {
    it("should display appbar", () => {
        const appbar = component.find("h6");

        expect(appbar).toHaveLength(1);
        expect(appbar.text()).toEqual("Kai: Graph As A Service");
    });

    it("should display a Sign in button in the appbar", () => {
        const signInButton = component.find("button#sign-out-button");

        expect(signInButton.text()).toEqual("Sign out");
    });

    it("should display menu in Navbar", () => {
        const cols = [{ name: "Create Graph" }, { name: "View Graphs" }, { name: "User Guide" }];
        const NavLi = component.find("li").at(1);

        NavLi.forEach((li, idx) => {
            const NavIcon = li.find("svg");
            expect(li.text()).toEqual(cols[idx].name);
            expect(NavIcon).toHaveLength(1);
        });
    });

    it("should have navigation link in each list item", () => {
        const Target = [{ href: "/creategraph" }, { href: "/viewgraphs" }, { href: "/userguide" }];
        const NavUl = component.find("ul").at(1);
        for (var index = 0; index < NavUl.length; index += 1) {
            const anchor = NavUl.find("a").at(index);
            const getAttribute = anchor.getDOMNode().getAttribute("href");
            expect(getAttribute).toBe(Target[index].href);
        }
    });
    describe("When REACT_APP_API_PLATFORM is set to OPENSHIFT", () => {
        beforeAll(() => {
            Config.REACT_APP_API_PLATFORM = "OPENSHIFT";
            mock.onGet("/whoami").reply(200, "test@test.com");
        });

        it("Should not show the login modal and should display the username and email", async () => {
            await mockOpenshiftClientReturn("test@test.com");
            await act(async () => {
                component = mount(
                    <MemoryRouter>
                        <NavigationAppbar />
                    </MemoryRouter>
                );
            });
            await component.update();
            await component.update();

            expect(component.find("input#username").length).toBe(0);
            expect(component.find("input#password").length).toBe(0);
            expect(component.find("div#signedin-user-details").text()).toBe("TESTtest@test.com");
        });
        it("Should display an error when getting the email has failed", async () => {
            mockOpenshiftClientToThrow(() => {
                throw new APIError("Server Error", "Timeout exception");
            });
            await act(async () => {
                component = mount(
                    <MemoryRouter>
                        <NavigationAppbar />
                    </MemoryRouter>
                );
            });
            expect(component.find("div#user-details-error-message").text()).toBe(
                "Failed to get user email: Server Error: Timeout exception"
            );
        });
    });
    describe("Display Signed In User Details", () => {
        beforeAll(() => {
            Config.REACT_APP_API_PLATFORM = "OTHER";
        });
        it("should display the username & email of the User who signed in", () => {
            mockAuthClient();
            inputUsername("Harry@gmail.com");
            inputPassword("asdfgh");

            clickSubmitSignIn();

            expect(component.find("div#signedin-user-details").text()).toBe("HARRYHarry@gmail.com");
        });
        it("should display the non-email username of the User who signed in", () => {
            mockAuthClient();
            inputUsername("testUser");
            inputPassword("zxcvb");

            clickSubmitSignIn();

            expect(component.find("div#signedin-user-details").text()).toBe("TESTUSERtestUser");
        });
    });
});

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

function clickSubmitSignIn() {
    component.find("button#submit-sign-in-button").simulate("click");
}

function mockAuthClient() {
    // @ts-ignore
    AuthApiClient.prototype.login.mockImplementationOnce(
        (username: string, password: string, onSuccess: () => void, onError: () => void) => {
            onSuccess();
        }
    );
}
async function mockOpenshiftClientReturn(email: string) {
    // @ts-ignore
    OpenshiftClient.mockImplementationOnce(() => ({
        getWhoAmI: () =>
            new Promise((resolve, reject) => {
                resolve(email);
            }),
    }));
}
async function mockOpenshiftClientToThrow(f: () => void) {
    // @ts-ignore
    OpenshiftClient.mockImplementationOnce(() => ({
        getWhoAmI: f,
    }));
}