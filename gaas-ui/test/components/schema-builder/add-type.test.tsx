import React from "react";
import {mount, ReactWrapper} from "enzyme";
import AddType from "../../../src/components/schema-builder/add-type";

let wrapper: ReactWrapper;
const addTypeMockCallBack = jest.fn();
beforeEach(() => {
    wrapper = mount(<AddType
        onAddType={addTypeMockCallBack}
        />)
});
afterEach(() => {
    wrapper.unmount();
});

describe("Add Type UI Component", () => {
    describe("Add Type inputs", () => {
        it("should have a Type Name input field", () => {
            const typeNameInputField = wrapper.find("input#type-name-input");
            
            expect(typeNameInputField.props().name).toBe("Type Name")

        });
        it("should have a Description input field", () => {
            const descriptionInputField = wrapper.find("input#type-description-input");

            expect(descriptionInputField.props().name).toBe("Type Description")

        });
        it("should have a Class input field", () => {
            const classInputField = wrapper.find("input#type-class-input");

            expect(classInputField.props().name).toBe("Type Class")

        });
    })
    describe("Add Type props", () => {
        it("should callback with an array of types when a new type has been added", () => {
            const expectedResult: object =
            {
                "test name":
                    {
                        "description": "test description",
                        "class":"test class"
                    },
            }

            addTypeName("test name");
            addTypeDescription("test description");
            addTypeClass("test class");
            clickAddType();

            expect(addTypeMockCallBack).toHaveBeenLastCalledWith(expectedResult);
        })
    })
    describe("Add Type Button", () => {
        it("should have an add type button", () => {
            const addTypeButton = wrapper.find("button#add-type-button");

            expect(addTypeButton.text()).toBe("Add Type");
        })
    })
})
function addTypeName(name: string) {
    const typeNameInputField = wrapper.find("input#type-name-input");
    typeNameInputField.simulate("change", {
            target: {value: name},
        })
}

function addTypeDescription(description: string) {
    const descriptionInputField = wrapper.find("input#type-description-input");
    descriptionInputField.simulate("change", {
        target: {value: description},
    })
}
function addTypeClass(className: string) {
    const classInputField = wrapper.find("input#type-class-input");
    classInputField.simulate("change", {
        target: {value: className},
    })
}
function clickAddType() {
    const addTypeButton = wrapper.find("button#add-type-button");
    addTypeButton.simulate("click");
}