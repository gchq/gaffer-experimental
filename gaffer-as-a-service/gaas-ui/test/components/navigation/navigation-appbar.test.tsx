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
import { Config } from "../../../src/rest/config";
import { act } from "react-dom/test-utils";
import { AuthSidecarClient, IWhatAuthInfo } from "../../../src/rest/clients/auth-sidecar-client";

jest.mock("../../../src/rest/clients/auth-api-client");
jest.mock("../../../src/rest/clients/auth-sidecar-client");

let component: ReactWrapper;

beforeEach(async () => {
    await act(async () => {
        component = mount(
            <MemoryRouter>
                <NavigationAppbar />
            </MemoryRouter>
        );
    });
});
afterEach(() => {
    component.unmount();
    jest.resetAllMocks();
});
afterAll(() => {
    process.env = Object.assign(process.env, { REACT_APP_API_PLATFORM: "" });
    Config.REACT_APP_API_PLATFORM = "";
});

describe("Navigation Appbar Component", () => {
    describe("getWhatAuth", () => {
        it("should call getWhatAuth on load and create login page based on response", async () => {
            await mockGetWhatAuthToReturn({
                attributes: {},
                requiredFields: ["username", "password"],
                requiredHeaders: { Authorization: "Bearer  " },
            });
            component = mount(
                <MemoryRouter>
                    <NavigationAppbar />
                </MemoryRouter>
            );
            await component.update();
            await component.update();

            expect(component.html().includes("login-modal")).toBe(true);
        });
        it("should call getWhatAuth on load and not create login page based on response", async () => {
            await mockGetWhatAuthToReturn({
                attributes: {
                    withCredentials: true,
                },
                requiredFields: [],
                requiredHeaders: {},
            });
            component = mount(
                <MemoryRouter>
                    <NavigationAppbar />
                </MemoryRouter>
            );
            await component.update();
            await component.update();

            expect(component.html().includes("login-modal")).toBe(false);
        });
        it("should call getWhatAuth on load and then call getWhoAmI", async () => {
            await act(async () => {
                await mockGetWhatAuthToReturn({
                    attributes: {
                        withCredentials: true,
                    },
                    requiredFields: [],
                    requiredHeaders: {},
                });
                await mockGetWhoAmIRepoToReturn("test@email.com");
                component = mount(
                    <MemoryRouter>
                        <NavigationAppbar />
                    </MemoryRouter>
                );
            });
            await component.update();
            await component.update();
            await component.update();
            expect(component.find("div#signedin-user-details").text()).toBe("TESTtest@email.com");
        });
    });
    it("should display appbar", () => {
        const appbar = component.find("h6");

        expect(appbar).toHaveLength(1);
        expect(appbar.text()).toEqual("Kai: Graph As A Service");
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
        for (let index = 0; index < NavUl.length; index += 1) {
            const anchor = NavUl.find("a").at(index);
            const getAttribute = anchor.getDOMNode().getAttribute("href");
            expect(getAttribute).toBe(Target[index].href);
        }
    });
    describe("Display Signed In User Details", () => {
        it("should display an error message when getWhoAmI Throws", async () => {
            await mockGetWhatAuthToReturn({
                attributes: {},
                requiredFields: ["username", "password"],
                requiredHeaders: { Authorization: "Bearer  " },
            });
            await mockAuthSidecarClientPostAuth();
            await mockGetWhoAmIRepoToThrow(() => {
                throw new Error("invalid");
            });

            component = mount(
                <MemoryRouter>
                    <NavigationAppbar />
                </MemoryRouter>
            );
            await component.update();
            await component.update();
            await inputUsername("Harry@gmail.com");
            await inputPassword("invalid-password");

            await clickSubmitSignIn();
            await component.update();
            await component.update();
            expect(component.find("div#navigation-drawer").find("div#user-details-error-message").text()).toBe(
                "Failed to get user email"
            );
        });
    });
});

async function inputUsername(username: string) {
    expect(component.find("input#username").length).toBe(1);
    component.find("input#username").simulate("change", {
        target: { value: username },
    });
}

async function inputPassword(password: string) {
    expect(component.find("input#password").length).toBe(1);
    component.find("input#password").simulate("change", {
        target: { value: password },
    });
}

async function clickSubmitSignIn() {
    component.find("button#submit-sign-in-button").simulate("click");
}
async function mockGetWhoAmIRepoToReturn(email: string) {
    // @ts-ignore
    AuthSidecarClient.mockImplementationOnce(() => ({
        getWhoAmI: () =>
            new Promise((resolve) => {
                resolve(email);
            }),
    }));
}
async function mockGetWhoAmIRepoToThrow(f: () => void) {
    // @ts-ignore
    AuthSidecarClient.mockImplementationOnce(() => ({
        getWhatAuth: f,
    }));
}

async function mockGetWhatAuthToReturn(data: IWhatAuthInfo) {
    // @ts-ignore
    AuthSidecarClient.mockImplementationOnce(() => ({
        getWhatAuth: () =>
            new Promise((resolve) => {
                resolve(data);
            }),
    }));
}

async function mockAuthSidecarClientPostAuth() {
    // @ts-ignore
    AuthSidecarClient.mockImplementationOnce(() => ({
        postAuth: () =>
            new Promise((resolve) => {
                resolve("Bearer Token ABC");
            }),
    }));
}
