import React from "react";
import { mount, ReactWrapper } from "enzyme";
import AddValidateFunctions from "../../../src/components/schema-builder/add-validate-functions";

let wrapper: ReactWrapper;
const onAddValidateFunctionsMockCallBack = jest.fn();
beforeEach(() => {
    wrapper = mount(<AddValidateFunctions onAddValidateFunctions={onAddValidateFunctionsMockCallBack} />);
});
afterEach(() => {
    wrapper.unmount();
});

describe("Add Property UI Component", () => {
    describe("Add Validate Function inputs", () => {
        it("should have a class value input field", () => {
            const classInput = wrapper.find("input#validate-functions-class-input");
            expect(classInput.props().name).toBe("Validate Functions Class");
        });
        it("should have additional key value input fields", () => {
            const additionalKeyInput = wrapper.find("input#additional-key-input");
            expect(additionalKeyInput.props().name).toBe("Validate Functions Key");
            const additionalValueInput = wrapper.find("input#additional-value-input");
            expect(additionalValueInput.props().name).toBe("Validate Functions Value");
        });
        it("should have a Add Key Value button", () => {
            const addButton = wrapper.find("button#add-additional-kv-button");

            expect(addButton.text()).toBe("Add Key Value Pair");
        });
        it("should have a react json viewer", () => {
            expect(wrapper.find("div#json-validate-functions-schema-viewer").text()).toEqual('"value":{}');
        });
    });

    describe("On Add Validate Functions", () => {
        it("should callback with a object when a new validate functions object has been added", () => {
            const expectedResult: object = {
                class: "value",
                secondTestKey: "secondTestValue",
                testKey: "testValue",
            };
            addClass("value");
            addAdditionalKeyValue("testKey", "testValue");
            addAdditionalKeyValue("secondTestKey", "secondTestValue");
            clickAddValidateFunctions();

            expect(onAddValidateFunctionsMockCallBack).toHaveBeenLastCalledWith(expectedResult);
        });
    });
    describe("Add Aggregate Function Button", () => {
        it("should have an add aggregate function button", () => {
            const addValidateFunctionsButton = wrapper.find("button#add-validate-functions-button");

            expect(addValidateFunctionsButton.text()).toBe("Add Validate Functions");
        });
        it("should be disabled class input is empty", () => {
            const addButton = wrapper.find("button#add-validate-functions-button");

            expect(addButton.props().disabled).toBe(true);
        });
    });
    describe("Add Key Value", () => {
        it("should be disabled when key and value empty", () => {
            const addButton = wrapper.find("button#add-additional-kv-button");

            expect(addButton.props().disabled).toBe(true);
        });
        it("should delete the key and value from the table when the delete icon is clicked", () => {
            addAdditionalKeyValue("testKey", "testValue");
            expect(wrapper.find("table").text()).toEqual("KeyValuetestKeytestValue");
            wrapper.find("button#testKey-delete-button").simulate("click");
            expect(wrapper.find("tbody#key-value-table-table-body").text()).toEqual("");
        });
    });
});

function addClass(value: string) {
    const classInput = wrapper.find("input#validate-functions-class-input");
    classInput.simulate("change", {
        target: { value: value },
    });
}

function clickAddValidateFunctions() {
    const addButton = wrapper.find("button#add-validate-functions-button");
    addButton.simulate("click");
}

function addAdditionalKeyValue(key: string, value: string) {
    wrapper.find("input#additional-key-input").simulate("change", {
        target: { value: key },
    });
    wrapper.find("input#additional-value-input").simulate("change", {
        target: { value: value },
    });
    wrapper.find("button#add-additional-kv-button").simulate("click");
}
