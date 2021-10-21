import {
    fireEvent,
    getAllByRole,
    getByDisplayValue,
    getByLabelText,
    getByRole,
    getByTestId,
    getByText,
    screen
} from "@testing-library/react";
import {mount, ReactWrapper} from "enzyme";
import React, {Component} from "react";
import SchemaBuilder from "../../../src/components/schema-builder/schema-builder";

let wrapper: ReactWrapper;
const onCreateSchemaMockCallBack = jest.fn();
beforeEach(() => {
    wrapper = mount(<SchemaBuilder elements={{}} onCreateTypesSchema={onCreateSchemaMockCallBack}
                                   typesSchema={ {
                                           "name":
                                               {
                                                   "description": "test description",
                                                   "class": "test.class"
                                               },
                                       }
                                   }
    />);
});
afterEach(() => {
    wrapper.unmount();
});
describe("schema-builder UI wrapper", () => {
    describe("Add schema elements buttons", () => {
        it("should have an Add Type button", () => {
            const addTypeButton = wrapper.find("button#add-type-button");
            expect(addTypeButton.text()).toBe("Add Type");
        });
        it("should have an Add Edge button", () => {
            const addEdgeButton = wrapper.find("button#add-edge-button");

            expect(addEdgeButton.text()).toBe("Add Edge");
        });
        it("should have an Add Entity button", () => {
            const addEntityButton = wrapper.find("button#add-entity-button");

            expect(addEntityButton.text()).toBe("Add Entity");
        });
    });
    describe("Schema builder props", () => {
        it("should callback types JSON when input", async() => {
            await wrapper.find("button#add-type-button").simulate("click");
            const dialog = screen.getByRole("dialog");
            const typeNameInputText = getByLabelText(dialog, "Type Name");
            const typeDescriptionInputText = getByLabelText(dialog, "Description");
            const typeClassInputText = getByLabelText(dialog, "Class");
            const buttons = getAllByRole(dialog, "button");
            const addTypesButtonClick = buttons[1];

            fireEvent.change(typeNameInputText, {target: {value: "someName"}});
            expect(getByDisplayValue(dialog, "someName")).toBeTruthy();

            fireEvent.change(typeDescriptionInputText, {target: {value: "someDescription"}});
            expect(getByDisplayValue(dialog, "someDescription")).toBeTruthy();

            fireEvent.change(typeClassInputText, {target: {value: "someClass"}});
            expect(getByDisplayValue(dialog, "someClass")).toBeTruthy();

            expect(getByLabelText(dialog, "Type Name")).toBeTruthy();

            fireEvent.click(addTypesButtonClick);
            fireEvent.click(buttons[0]);
            expect(getByDisplayValue(dialog, "someName")).toBeTruthy();
            await wrapper.update();
            await wrapper.update();
            await wrapper.update();
            // console.log(wrapper.html());
            expect(wrapper.find("div#json-schema-viewer").text()).toEqual("");

        });
        fit("should update the json viewer with the added type", async() => {
            wrapper.find("button#add-type-button").simulate("click");
            addTypeName("testName");
            addTypeDescription("testDescription");
            addTypeClass("testClass");

            clickAddType();

            await clickCloseAddType();
            await wrapper.update();
            await wrapper.update();
            await wrapper.update();

            expect(wrapper.find("div#json-schema-viewer").text()).toEqual("");


        });
        it("should display the types schema that is passed in", () => {
            expect(wrapper.find("div#json-schema-viewer").text()).toEqual('{"types":{"test name":{"description":"test description""class":"test class"}}}'
            );
        });
        it("should display the new type appended to the old types, when a new type is added", () => {

        });
    });
});

function addTypeName(name: string) {
    const addTypeNameInput = wrapper.find("div#add-type-dialog").find("input").at(0);
    addTypeNameInput.simulate("change", {
        target: {name: "Type Name", value: name},
    });
}

function addTypeDescription(description: string) {
    const descriptionInputField = wrapper.find("div#add-type-dialog").find("input").at(1);
    descriptionInputField.simulate("change", {
        target: {name: "Type Description", value: description},
    });
}

function addTypeClass(className: string) {
    const classInputField = wrapper.find("div#add-type-dialog").find("input").at(2);
    classInputField.simulate("change", {
        target: {name: "Type Class", value: className},
    });
}

function clickAddType() {
    const addTypeButton = wrapper.find("div#add-type-dialog").find("button#add-type-button");
    addTypeButton.simulate("click");
}

function clickCloseAddType() {
    const closeAddTypeButton = wrapper.find("div#add-type-dialog").find("button#close-add-type-button");
    closeAddTypeButton.simulate("click");
}