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

import React from "react";
import { mount, ReactWrapper } from "enzyme";
import AddGroupby from "../../../src/components/schema-builder/add-groupby";

let wrapper: ReactWrapper;
const onAddGroupbyMockCallBack = jest.fn();
beforeEach(() => {
    wrapper = mount(<AddGroupby onAddGroupby={onAddGroupbyMockCallBack} />);
});
afterEach(() => {
    wrapper.unmount();
});

describe("Add GroupBy UI Component", () => {
    describe("Add Property inputs", () => {
        it("should have a property key input field", () => {
            const propertyKeyField = wrapper.find("input#groupby-key-input");

            expect(propertyKeyField.props().name).toBe("Groupby Key");
        });
    });
    describe("On Add GroupBy", () => {
        it("should callback with a string when a new groupBy value has been added", () => {
            const expectedResult: string = "startDate";

            addGroupByValue("startDate");
            clickAddGroupBy();

            expect(onAddGroupbyMockCallBack).toHaveBeenLastCalledWith(expectedResult);
        });
    });
    describe("Add GroupBy Button", () => {
        it("should have an add groupby button", () => {
            const addGroupByButton = wrapper.find("button#add-groupby-button-groupby-dialog");

            expect(addGroupByButton.text()).toBe("Add Groupby");
        });
    });
});

function addGroupByValue(key: string) {
    const propertyKeyInputField = wrapper.find("input#groupby-key-input");
    propertyKeyInputField.simulate("change", {
        target: { value: key },
    });
}

function clickAddGroupBy() {
    const addPropertyButton = wrapper.find("button#add-groupby-button-groupby-dialog");
    addPropertyButton.simulate("click");
}
