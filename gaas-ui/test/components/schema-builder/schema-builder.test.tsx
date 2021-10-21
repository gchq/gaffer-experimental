import { fireEvent, getAllByRole, getByDisplayValue, getByLabelText, getByRole, getByTestId, getByText, screen } from "@testing-library/react";
import {mount, ReactWrapper} from "enzyme";
import React, { Component } from "react";
import SchemaBuilder from "../../../src/components/schema-builder/schema-builder";

let wrapper: ReactWrapper;
const onCreateSchemaMockCallBack = jest.fn();
beforeEach(() => {
    wrapper = mount(<SchemaBuilder elements={{}} onCreateTypesSchema={onCreateSchemaMockCallBack} typesSchema={{ types: {} }} />)
})
afterEach(() => {
    wrapper.unmount();
})
describe("schema-builder UI component", () => {
    describe("Add schema elements buttons", () => {
        it("should have an Add Type button", ()=> {
            const addTypeButton = wrapper.find("button#add-type-button");
            expect(addTypeButton.text()).toBe("Add Type");
        });
        it("should have an Add Edge button", ()=> {
            const addEdgeButton = wrapper.find("button#add-edge-button");

            expect(addEdgeButton.text()).toBe("Add Edge");
        });
        it("should have an Add Entity button", ()=> {
            const addEntityButton = wrapper.find("button#add-entity-button");

            expect(addEntityButton.text()).toBe("Add Entity");
        });
    })
    // describe("Dialog is displayed when buttons clicked", ()=>{
    //     it("should display types dialog when add types is clicked", ()=>{
    //         wrapper.setState({openTypes: true});
    //         console.log(wrapper.html());
    //         wrapper.find("button#add-type-button").simulate("click");
    //         //console.log(wrapper.html());
    //     })
    // })
    describe("Schema builder props", () =>{
        const component = mount(<SchemaBuilder elements={{}} onCreateTypesSchema={onCreateSchemaMockCallBack} typesSchema={{"types":{
            "test name":
                {
                    "description": "test description",
                    "class":"test class"
                },
        }}} />)  
        it("should callback types JSON when input", async ()=>{
            await wrapper.find("button#add-type-button").simulate("click");
            const dialog = screen.getByRole("dialog")
            const typeNameInputText = getByLabelText(dialog, "Type Name");
            const typeDescriptionInputText = getByLabelText(dialog, "Description");
            const typeClassInputText = getByLabelText(dialog, "Class");
            const buttons = getAllByRole(dialog,"button");
            const addTypesButtonClick = buttons[1]

            fireEvent.change(typeNameInputText, {target: {value: "someName"}})
            expect(getByDisplayValue(dialog, "someName")).toBeTruthy()

            fireEvent.change(typeDescriptionInputText, {target: {value: "someDescription"}})
            expect(getByDisplayValue(dialog, "someDescription")).toBeTruthy()

            fireEvent.change(typeClassInputText, {target: {value: "someClass"}})
            expect(getByDisplayValue(dialog, "someClass")).toBeTruthy()

            expect(getByLabelText(dialog, "Type Name")).toBeTruthy()

            fireEvent.click(addTypesButtonClick)
            fireEvent.click(buttons[0])
            await wrapper.update()
            await wrapper.update()
            await wrapper.update()
            expect(component.find("div#json-schema-viewer").text()).toEqual( "{\"types\":{\"test name\":{\"description\":\"test description\"\"class\":\"test class\"}}}"
            );
        })
        it("should display the types schema that is passed in", ()=>{
            expect(component.find("div#json-schema-viewer").text()).toEqual( "{\"types\":{\"test name\":{\"description\":\"test description\"\"class\":\"test class\"}}}"
            );
        })
        it("should display the new type appended to the old types, when a new type is added", () => {
            
        })
    })
})