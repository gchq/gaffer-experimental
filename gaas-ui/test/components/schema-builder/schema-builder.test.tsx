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
        it("should callback types JSON when input", ()=>{

        })
        it("should display the types schema that is passed in", ()=>{
            const expectedResult: object = 
            
            {"types":{
                "test name":
                    {
                        "description": "test description",
                        "class":"test class"
                    },
            }}
            expect(component.find("div#json-schema-viewer").text()).toEqual(expectedResult);
        })
    })
})