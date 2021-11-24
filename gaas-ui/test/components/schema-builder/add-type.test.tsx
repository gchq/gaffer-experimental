import React from "react";
import { mount, ReactWrapper } from "enzyme";
import AddType from "../../../src/components/schema-builder/add-type";
import { act } from "react-dom/test-utils";

let wrapper: ReactWrapper;
const onAddTypeMockCallBack = jest.fn();
beforeEach(() => {
    wrapper = mount(<AddType onAddType={onAddTypeMockCallBack} />);
});
afterEach(() => {
    wrapper.unmount();
});

describe("Add Type UI Component", () => {
    describe("Add Type inputs", () => {
        it("should have a Type Name input field", () => {
            const typeNameInputField = wrapper.find("input#type-name-input");

            expect(typeNameInputField.props().name).toBe("Type Name");
        });

        it("should display error message when invalid type name entered", () => {
            wrapper.find("input#type-name-input").simulate("change", {
                target: { value: "type name 1" },
            });

            expect(wrapper.find("p#type-name-input-helper-text").text()).toBe("Type name can only contain letters");
        });

        it("should have a Description input field", () => {
            const descriptionInputField = wrapper.find("input#type-description-input");

            expect(descriptionInputField.props().name).toBe("Type Description");
        });

        it("should display error message when invalid type description entered", () => {
            wrapper.find("input#type-description-input").simulate("change", {
                target: { value: "Type description +" },
            });

            expect(wrapper.find("p#type-description-input-helper-text").text()).toBe(
                "Type description can only contain alpha numeric letters and spaces"
            );
        });
        it("should have a Class input field", () => {
            const classInputField = wrapper.find("input#type-class-input");

            expect(classInputField.props().name).toBe("Type Class");
        });

        it("should display error message when invalid type class entered", () => {
            wrapper.find("input#type-class-input").simulate("change", {
                target: { value: "Type class 1" },
            });

            expect(wrapper.find("p#type-class-input-helper-text").text()).toBe("Type class can only contain letters");
        });
    });

    describe("Disable | Enable Add Type Button", () => {
        it("should be disabled when Type Name field is empty", () => {
            addTypeDescription("test description");
            addTypeClass("test.class");

            expect(wrapper.find("button#add-type-button").props().disabled).toBe(true);
        });

        it("should be disabled when Type description field is empty", () => {
            addTypeName("testName");
            addTypeClass("test.class");

            expect(wrapper.find("button#add-type-button").props().disabled).toBe(true);
        });

        it("should be disabled when Type class field is empty", () => {
            addTypeDescription("test description");
            addTypeName("testName");

            expect(wrapper.find("button#add-type-button").props().disabled).toBe(true);
        });

        it("should be disabled when Type name, description and class fields are empty", () => {
            expect(wrapper.find("button#add-type-button").props().disabled).toBe(true);
        });

        it("should be enabled when Type name, description and class fields are not empty", () => {
            addTypeName("testName");
            addTypeDescription("test description");
            addTypeClass("test.class");
            expect(wrapper.find("button#add-type-button").props().disabled).toBe(false);
        });
    });
    describe("Add Aggregate Function Dialog", () => {
        it("should add the aggregateFunction added in the aggregateFunction dialog to the aggregateFunction textarea", async () => {
            await addAggregateFunctionInDialog("testAggregateFunction");

            expect(wrapper.find("textarea#type-aggregate-function-input").text()).toBe(
                '{"class":"testAggregateFunction"}'
            );
        });
    });
    describe("Add Serialiser Dialog", () => {
        it("should add the Serialiser added in the Serialiser dialog to the Serialiser textarea", async () => {
            await addSerialiserInDialog("testSerialiser");

            expect(wrapper.find("textarea#type-serialiser-input").text()).toBe('{"class":"testSerialiser"}');
        });
    });
    describe("On Add Type", () => {
        it("should callback with a type object when a new type has been added", async () => {
            const expectedResult: object = {
                testName: {
                    description: "test description",
                    class: "test.class",
                    aggregateFunction: {
                        class: "testAggregateFunction",
                    },
                    serialiser: {
                        class: "test",
                    },
                    validateFunctions: [
                        {
                            class: "uk.gov.gchq.koryphe.impl.predicate.Exists",
                        },
                    ],
                },
            };

            addTypeName("testName");
            addTypeDescription("test description");
            addTypeClass("test.class");
            await addAggregateFunctionInTextarea('{"class":"testAggregateFunction"}');
            await addSerialiserInTextarea('{"class":"test"}');
            await addValidateFunctionsInTextarea('{"class": "uk.gov.gchq.koryphe.impl.predicate.Exists"}');
            clickAddType();

            expect(onAddTypeMockCallBack).toHaveBeenLastCalledWith(expectedResult);
        });
        it("should callback with a type object when a new type has been added using aggregateFunction and serialiser dialogs", async () => {
            const expectedResult: object = {
                testName: {
                    description: "test description",
                    class: "test.class",
                    aggregateFunction: {
                        class: "testAggregateFunction",
                    },
                    serialiser: {
                        class: "testSerialiser",
                    },
                },
            };

            await addTypeName("testName");
            await addTypeDescription("test description");
            await addTypeClass("test.class");
            await addAggregateFunctionInDialog("testAggregateFunction");
            await addSerialiserInDialog("testSerialiser");

            await clickAddType();

            expect(onAddTypeMockCallBack).toHaveBeenLastCalledWith(expectedResult);
        });
        it("should callback with a type object when a new type has been added using validateFunctions dialog", async () => {
            const expectedResult: object = {
                testName: {
                    description: "test description",
                    class: "test.class",
                    validateFunctions: [
                        {
                            class: "test.class",
                            testAdditionalKey: "someValue",
                        },
                        {
                            class: "test.class2",
                            testAdditionalKey: "someValue",
                        },
                    ],
                },
            };

            await addTypeName("testName");
            await addTypeDescription("test description");
            await addTypeClass("test.class");
            await addValidateFunctionInDialog("test.class");
            await addValidateFunctionInDialog("test.class2");

            await clickAddType();

            expect(onAddTypeMockCallBack).toHaveBeenLastCalledWith(expectedResult);
        });
    });
    describe("Add Type Button", () => {
        it("should have an add type button", () => {
            const addTypeButton = wrapper.find("button#add-type-button");

            expect(addTypeButton.text()).toBe("Add Type");
        });
    });
});

function addTypeName(name: string) {
    const typeNameInputField = wrapper.find("input#type-name-input");
    typeNameInputField.simulate("change", {
        target: { value: name },
    });
}

function addTypeDescription(description: string) {
    const descriptionInputField = wrapper.find("input#type-description-input");
    descriptionInputField.simulate("change", {
        target: { value: description },
    });
}

function addTypeClass(className: string) {
    const classInputField = wrapper.find("input#type-class-input");
    classInputField.simulate("change", {
        target: { value: className },
    });
}
async function addAggregateFunctionInTextarea(aggregateFunction: string) {
    await act(() => {
        const aggregateFunctionInput = wrapper.find("textarea#type-aggregate-function-input");

        aggregateFunctionInput.simulate("change", {
            target: { value: aggregateFunction },
        });
    });
}
async function addSerialiserInTextarea(serialiser: string) {
    await act(() => {
        const aggregateFunctionInput = wrapper.find("textarea#type-serialiser-input");

        aggregateFunctionInput.simulate("change", {
            target: { value: serialiser },
        });
    });
}
async function addValidateFunctionsInTextarea(validateFuntions: string) {
    await act(() => {
        const aggregateFunctionInput = wrapper.find("textarea#type-validate-functions-input");

        aggregateFunctionInput.simulate("change", {
            target: { value: validateFuntions },
        });
    });
}
async function addAggregateFunctionInDialog(aggregateFunction: string) {
    await wrapper.find("button#add-aggregate-function-button").simulate("click");
    await act(() => {
        const aggregateFunctionInput = wrapper
            .find("div#add-aggregate-function-dialog")
            .find("div#add-aggregate-function-inputs")
            .find("input#aggregate-function-value-input");
        aggregateFunctionInput.simulate("change", {
            target: { value: aggregateFunction },
        });
    });
    await wrapper
        .find("div#add-aggregate-function-dialog")
        .find("div#add-aggregate-function-inputs")
        .find("button#add-aggregate-function-button")
        .simulate("click");
}
async function addSerialiserInDialog(serialiser: string) {
    await wrapper.find("button#add-serialiser-button").simulate("click");
    await act(() => {
        const serialiserInput = wrapper
            .find("div#add-serialiser-dialog")
            .find("div#add-serialiser-inputs")
            .find("input#serialiser-value-input");
        serialiserInput.simulate("change", {
            target: { value: serialiser },
        });
    });
    await wrapper
        .find("div#add-serialiser-dialog")
        .find("div#add-serialiser-inputs")
        .find("button#add-serialiser-button")
        .simulate("click");
}

async function addValidateFunctionInDialog(classInput: string) {
    await wrapper.find("button#add-validate-function-button").simulate("click");
    await act(() => {
        const addClass = wrapper
            .find("div#add-validate-functions-dialog")
            .find("div#add-validate-functions-inputs")
            .find("input#validate-functions-class-input");
        addClass.simulate("change", {
            target: { value: classInput },
        });
        const addAdditionalKey = wrapper
            .find("div#add-validate-functions-dialog")
            .find("div#add-validate-functions-inputs")
            .find("input#validate-functions-additional-key-input");
        addAdditionalKey.simulate("change", {
            target: { value: "testAdditionalKey" },
        });
        const addAdditionalValue = wrapper
            .find("div#add-validate-functions-dialog")
            .find("div#add-validate-functions-inputs")
            .find("input#validate-functions-additional-value-input");
        addAdditionalValue.simulate("change", {
            target: { value: "someValue" },
        });
    });
    await wrapper
        .find("div#add-validate-functions-dialog")
        .find("div#add-validate-functions-inputs")
        .find("button#add-additional-kv-button")
        .simulate("click");
    await wrapper
        .find("div#add-validate-functions-dialog")
        .find("div#add-validate-functions-inputs")
        .find("button#add-validate-functions-button")
        .simulate("click");
}

function clickAddType() {
    const addTypeButton = wrapper.find("button#add-type-button");
    addTypeButton.simulate("click");
}
