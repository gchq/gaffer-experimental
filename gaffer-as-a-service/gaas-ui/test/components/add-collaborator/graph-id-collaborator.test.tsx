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
import GraphIdUsernameInput from "../../../src/components/add-collaborator/graph-id-collaborator";
import React from "react";

const usernameMockCallBack = jest.fn();

const component: ReactWrapper = mount(
    <GraphIdUsernameInput
        graphIdValue="display-id"
        usernameValue="Inputted username here"
        onChangeUsername={usernameMockCallBack}
    />
);

afterEach(() => jest.resetAllMocks());

describe("Graph ID & Username", () => {
    it("should populate input value with usernameValue prop", () => {
        expect(component.find("input#username-input").props().value).toBe("Inputted username here");
    });

    it("should call back with username and boolean when character inputted", () => {
        component.find("input#username-input").simulate("change", {
            target: { value: "id" },
        });

        expect(usernameMockCallBack).toHaveBeenLastCalledWith("id", true);
    });
    it("should display error message when invalid username entered", () => {
        component.find("input#username-input").simulate("change", {
            target: { value: "id+" },
        });

        expect(component.find("p#username-helper-text").text()).toBe(
            "User name can only contain alphanumeric and some special characters @ . - _"
        );
    });
});
