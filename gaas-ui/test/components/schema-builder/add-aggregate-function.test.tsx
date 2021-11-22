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
                key: "class",
                value: "value",
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
