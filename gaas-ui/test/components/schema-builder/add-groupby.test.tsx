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
            const addPropertyButton = wrapper.find("button#add-groupby-button");

            expect(addPropertyButton.text()).toBe("Add Groupby");
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
    const addPropertyButton = wrapper.find("button#add-groupby-button");
    addPropertyButton.simulate("click");
}
