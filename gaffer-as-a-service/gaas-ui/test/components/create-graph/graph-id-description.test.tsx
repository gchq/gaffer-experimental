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

import { mount, ReactWrapper } from "enzyme";
import GraphIdDescriptionInput from "../../../src/components/create-graph/graph-id-description";
import React from "react";

const graphIdMockCallBack = jest.fn();
const descriptionMockCallBack = jest.fn();

const component: ReactWrapper = mount(
    <GraphIdDescriptionInput
        graphIdValue="display-id"
        descriptionValue="Inputted description here"
        onChangeGraphId={graphIdMockCallBack}
        onChangeDescription={descriptionMockCallBack}
    />
);

afterEach(() => jest.resetAllMocks());

describe("Graph ID & Description", () => {
    it("should populate input value with graphIdValue prop", () => {
        expect(component.find("input#graph-id-input").props().value).toBe("display-id");
    });
    it("should populate input value with graphIdValue prop", () => {
        expect(component.find("textarea#graph-description-input").props().value).toBe("Inputted description here");
    });
    it("should call back with graph id and boolean when character inputted", () => {
        component.find("input#graph-id-input").simulate("change", {
            target: { value: "id" },
        });

        expect(graphIdMockCallBack).toHaveBeenLastCalledWith("id", true);
    });
    it("should display error message when invalid graph id entered", () => {
        component.find("input#graph-id-input").simulate("change", {
            target: { value: "id+" },
        });

        expect(component.find("p#graph-id-helper-text").text()).toBe(
            "Graph ID can only contain numbers and lowercase letters"
        );
    });
    it("should call back with graph id and boolean when character inputted", () => {
        component.find("textarea#graph-description-input").simulate("change", {
            target: { value: "Some description" },
        });

        expect(descriptionMockCallBack).toHaveBeenLastCalledWith("Some description", true);
    });
});
