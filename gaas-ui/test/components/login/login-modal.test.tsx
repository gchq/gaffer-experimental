import { Dialog } from "@material-ui/core";
import { mount, ReactWrapper } from "enzyme";
import React from "react";
import LoginModal from "../../../src/components/login/login-modal";
import { AuthApiClient } from "../../../src/rest/clients/auth-api-client";

jest.mock("../../../src/rest/clients/auth-api-client");

let component: ReactWrapper;
const jestMock = jest.fn();
const usernameCallback = jest.fn();

beforeAll(
  () =>
    (process.env = Object.assign(process.env, {
      REACT_APP_API_PLATFORM: "AWS",
    }))
);
beforeEach(() => {
  component = mount(<LoginModal onLogin={usernameCallback} />);
});
afterEach(() => {
  component.unmount();
  jestMock.mockReset();
});
afterAll(
  () =>
    (process.env = Object.assign(process.env, { REACT_APP_API_PLATFORM: "" }))
);

describe("On Render", () => {
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
    (
      username: string,
      password: string,
      onSuccess: () => void,
      onError: () => void
    ) => {
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
