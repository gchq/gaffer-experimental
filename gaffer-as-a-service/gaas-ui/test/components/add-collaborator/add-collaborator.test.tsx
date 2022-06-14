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
import { act } from "react-dom/test-utils";
import AddCcollaborator from "../../../src/components/add-collaborator/add-collaborator";
import { AddCollaboratorRepo } from "../../../src/rest/repositories/add-collaborator-repo";

jest.mock("../../../src/rest/repositories/add-collaborator-repo");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLocation: () => ({ state: { graphId: "graphId" } }),
}));

let wrapper: ReactWrapper;

beforeEach(async () => {
    wrapper = mount(<AddCcollaborator />);
});

afterEach(() => {
    wrapper.unmount();
    jest.resetAllMocks();
});

describe("AddCollaborator UI component", () => {
    describe("Layout On Render", () => {
        it("Should have a Graph Id, username inputs", () => {
            const graphId = wrapper.find("input#graph-id-input");
            expect(graphId.props().value).toBe("graphId");

            const username = wrapper.find("input#username-input");
            expect(username.props().name).toBe("User Name");
        });

        it("should capture username correctly onChange", () => {
            const username = wrapper.find("input#username-input");
            inputUsername("John");
            // expect(graphId.props().value).toBe("John");
            expect(username.instance().value).toBe("John");
        });

        it("should be disabled when username field is empty", () => {
            inputUsername("");

            expect(wrapper.find("button#add-collaborator-button").props().disabled).toBe(true);
        });
        it("should have a Submit button", () => {
            const submitButton = wrapper.find("button#add-collaborator-button").text();
            expect(submitButton).toBe("Add Collaborator");
        });
    });

    describe("On Submit Request", () => {
        it("should display success message in the NotificationAlert", async () => {
            const mock = jest.fn();
            mockAddCollaboratorRepoWithFunction(mock);
            await inputUsername("John");
            await wrapper.update();
            await wrapper.update();
            await clickSubmit();
            await wrapper.update();
            await wrapper.update();
           expect(wrapper.find("div#notification-alert").text()).toBe("graphId was successfully added collaborator");
            expect(mock).toHaveBeenLastCalledWith("graphId", "John");
      
        });
    });
});

async function clickSubmit(): Promise<void> {
    await act(async () => {
        wrapper.find("button#add-collaborator-button").simulate("click");
    });
}

function inputUsername(username: string): void {
    wrapper.find("input#username-input").simulate("change", {
        target: { value: username },
    });
}

function mockAddCollaboratorRepoWithFunction(f: () => void): void {
    // @ts-ignore
    AddCollaboratorRepo.mockImplementationOnce(() => ({
        addCollaborator: f,
    }
}