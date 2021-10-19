import {mount, ReactWrapper} from "enzyme";
import AddType from "../../../src/components/schema-builder/add-type";

let wrapper: ReactWrapper;
beforeEach(() => {
    wrapper = mount(<AddType/>)
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
    describe("Add Type Button", () => {
        it("should have an add type button", () => {
            const addTypeButton = wrapper.find("button#add-type-button");

            expect(addTypeButton.text()).toBe("Add Type");
        })
    })
})