/*
 * Copyright 2022 Crown Copyright
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

import React from "react";
import { mount, ReactWrapper } from "enzyme";
import AddAggregateFunction from "../../../src/components/schema-builder/add-aggregate-function";

let wrapper: ReactWrapper;
const onAddAggregateFunctionMockCallBack = jest.fn();
beforeEach(() => {
    wrapper = mount(<AddAggregateFunction onAddAggregateFunction={onAddAggregateFunctionMockCallBack} />);
});
afterEach(() => {
    wrapper.unmount();
});

describe("Add Property UI Component", () => {
    describe("Add Aggregate Function inputs", () => {
        it("should have a property value input field", () => {
            const aggregateValueField = wrapper.find("input#aggregate-function-value-input");
            expect(aggregateValueField.props().name).toBe("Aggregate Function Value");
        });
    });

    describe("On Add Aggregate Function", () => {
        it("should callback with a object when a new aggregate function has been added", () => {
            const expectedResult: object = {
                class: "value",
            };
            addAggregateValue("value");
            clickAddAggregate();

            expect(onAddAggregateFunctionMockCallBack).toHaveBeenLastCalledWith(expectedResult);
        });
    });
    describe("Add Aggregate Function Button", () => {
        it("should have an add aggregate function button", () => {
            const addAggregateFunctionButton = wrapper.find("button#add-aggregate-function-button");

            expect(addAggregateFunctionButton.text()).toBe("Add Aggregate Function");
        });
        it("should be disabled when value empty", () => {
            const addPropertyButton = wrapper.find("button#add-aggregate-function-button");

            expect(addPropertyButton.props().disabled).toBe(true);
        });
    });
});

function addAggregateValue(value: string) {
    const propertyKeyInputField = wrapper.find("input#aggregate-function-value-input");
    propertyKeyInputField.simulate("change", {
        target: { value: value },
    });
}

function clickAddAggregate() {
    const addPropertyButton = wrapper.find("button#add-aggregate-function-button");
    addPropertyButton.simulate("click");
}
