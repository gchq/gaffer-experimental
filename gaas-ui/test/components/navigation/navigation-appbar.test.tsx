import { mount, ReactWrapper } from "enzyme";
import NavigationAppbar from "../../../src/components/navigation-bar/navigation-appbar";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthApiClient } from "../../../src/rest/clients/auth-api-client";

jest.mock("../../../src/rest/clients/auth-api-client");

let component: ReactWrapper;

beforeAll(
    () =>
        (process.env = Object.assign(process.env, {
            REACT_APP_API_PLATFORM: "test",
        }))
);
beforeEach(() => {
    component = mount(
        <MemoryRouter>
            <NavigationAppbar />
        </MemoryRouter>
    );
});
afterEach(() => component.unmount());
afterAll(() => (process.env = Object.assign(process.env, { REACT_APP_API_PLATFORM: "" })));

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
        const cols = [
            { name: "Create Graph" },
            { name: "View Graphs" },
            { name: "Cluster Namespaces" },
            { name: "User Guide" },
        ];
        const NavLi = component.find("li").at(1);

        NavLi.forEach((li, idx) => {
            const NavIcon = li.find("svg");
            expect(li.text()).toEqual(cols[idx].name);
            expect(NavIcon).toHaveLength(1);
        });
    });

    it("should have navigation link in each list item", () => {
        const Target = [{ href: "/creategraph" }, { href: "/viewgraphs" }, { href: "/namespaces" }, { href: "/userguide" }];
        const NavUl = component.find("ul").at(1);
        for (var index = 0; index < NavUl.length; index += 1) {
            const anchor = NavUl.find("a").at(index);
            const getAttribute = anchor.getDOMNode().getAttribute("href");
            expect(getAttribute).toBe(Target[index].href);
        }
    });
});

describe("Display Signed In User Details", () => {
    it("should display the username & email of the User who signed in", () => {
        mockAuthClient();
        inputUsername("Harry@gmail.com");
        inputPassword("asdfgh");

        clickSubmitSignIn();

        expect(component.find("div#signedin-user-details").text()).toBe("HarryHarry@gmail.com");
    });
    it("should display the non-email username of the User who signed in", () => {
        mockAuthClient();
        inputUsername("Batman");
        inputPassword("zxcvb");

        clickSubmitSignIn();

        expect(component.find("div#signedin-user-details").text()).toBe("BatmanBatman");
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
