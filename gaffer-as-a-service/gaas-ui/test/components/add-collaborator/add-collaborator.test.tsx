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

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLocation: () => ({ state: { graphId: "graphId" } }),
}));

let wrapper: ReactWrapper;

beforeEach(async () => {
    wrapper = mount(<AddCcollaborator />);
});

afterEach(() => {
    jest.resetAllMocks();
});

describe("AddCollaborator UI component", () => {
    describe("Layout On Render", () => {
        it("Should have a Graph Id, username inputs", () => {
            const graphIdTextfield = wrapper.find("input");
            expect(graphIdTextfield.at(0).props().name).toBe("graph-id");

            const usernameTextfield = wrapper.find("input");
            expect(usernameTextfield.at(1).props().name).toBe("User Name");
        });
        it("should have a Submit button", () => {
            const submitButton = wrapper.find("button#add-collaborator-button").text();
            expect(submitButton).toBe("Add Collaborator");
        });
    });
});
