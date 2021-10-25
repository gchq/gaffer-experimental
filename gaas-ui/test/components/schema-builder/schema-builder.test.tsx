import {mount, ReactWrapper} from "enzyme";
import React from "react";
import SchemaBuilder from "../../../src/components/schema-builder/schema-builder";
import {act} from "react-dom/test-utils";
import {Backdrop} from "@material-ui/core";


let wrapper: ReactWrapper;
const onCreateSchemaMockCallBack = jest.fn();
beforeEach(() => {
    wrapper = mount(<SchemaBuilder elements={{}} onCreateTypesSchema={onCreateSchemaMockCallBack}
                                   typesSchema={{
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
        //TODO: Test that when a new type is added it is appended to existing types
        it("should update the json viewer with the added type from the add type dialog", async() => {
            wrapper.find("button#add-type-button").simulate("click");
            await addTypeName("testName");
            await addTypeDescription("testDescription");
            await addTypeClass("testClass");

            await wrapper.update();
            await wrapper.update();
            await wrapper.update();
            await clickAddType();
            await wrapper.update();
            await wrapper.update();
            await wrapper.update();
            await clickCloseAddTypeDialog();
            await wrapper.update();
            await wrapper.update();
            await wrapper.update();

            expect(wrapper.find("div#json-schema-viewer").text()).toEqual("");


        });
        it("should display the types schema that is passed in", () => {
            expect(wrapper.find("div#json-schema-viewer").text()).toEqual('"types":{"name":{"description":"test description""class":"test.class"}}'
            );
        });
        it("should display the new type appended to the old types, when a new type is added", () => {

        });
    });
});

async function addTypeName(name: string) {
    await act(async() => {
        const addTypeNameInput = wrapper.find("div#add-type-dialog").find("input").at(0);
        addTypeNameInput.simulate("change", {
            target: {name: "Type Name", value: name},
        });
    });
}

async function addTypeDescription(description: string) {
    await act(async() => {
        const descriptionInputField = wrapper.find("div#add-type-dialog").find("input").at(1);
        descriptionInputField.simulate("change", {
            target: {name: "Type Description", value: description},
        });
    });
}

async function addTypeClass(className: string) {
    await act(async() => {
        const classInputField = wrapper.find("div#add-type-dialog").find("input").at(2);
        classInputField.simulate("change", {
            target: {name: "Type Class", value: className},
        });
    });
}

async function clickAddType() {
    await act(async() => {
        const addTypeButton = wrapper.find("div#add-type-dialog").find("button#add-type-button");
        addTypeButton.simulate("click");
    });
}

async function clickCloseAddTypeDialog() {
    act(() => {
        const closeAddTypeButton = wrapper.find("div#add-type-dialog").find("button#close-add-type-button");
        wrapper.find(Backdrop).simulate("click");
        closeAddTypeButton.simulate("click");
    });
    expect(wrapper.find("div#add-type-dialog").html()).toBe(0);
}