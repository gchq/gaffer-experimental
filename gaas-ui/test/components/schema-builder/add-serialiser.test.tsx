import React from "react";
import { mount, ReactWrapper } from "enzyme";
import AddSerialiser from "../../../src/components/schema-builder/add-serialiser";

let wrapper: ReactWrapper;
const onAddSerialiserMockCallBack = jest.fn();
beforeEach(() => {
    wrapper = mount(<AddSerialiser onAddSerialiser={onAddSerialiserMockCallBack} />);
});
afterEach(() => {
    wrapper.unmount();
});

describe("Add Property UI Component", () => {
    describe("Add Serialiser input", () => {
        it("should have a property value input field", () => {
            const serialiserValueField = wrapper.find("input#serialiser-value-input");
            expect(serialiserValueField.props().name).toBe("Serialiser Value");
        });
    });

    describe("On Add Serialiser", () => {
        it("should callback with a object when a new serialiser has been added", () => {
            const expectedResult: object = {
                class: "value",
            };
            addSerialiserValue("value");
            clickAddSerialiser();

            expect(onAddSerialiserMockCallBack).toHaveBeenLastCalledWith(expectedResult);
        });
    });
    describe("Add Serialiser Button", () => {
        it("should have an add serialiser button", () => {
            const addSerialiserButton = wrapper.find("button#add-serialiser-button");

            expect(addSerialiserButton.text()).toBe("Add Serialiser");
        });
        it("should be disabled when the Serialiser text area is empty", () => {
            expect(wrapper.find("button#add-serialiser-button").props().disabled).toBe(true);
        });
    });
});

function addSerialiserValue(value: string) {
    const serialiserKeyInputField = wrapper.find("input#serialiser-value-input");
    serialiserKeyInputField.simulate("change", {
        target: { value: value },
    });
}

function clickAddSerialiser() {
    const addSerialiser = wrapper.find("button#add-serialiser-button");
    addSerialiser.simulate("click");
}
