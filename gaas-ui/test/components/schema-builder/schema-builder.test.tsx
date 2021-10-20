import {mount, ReactWrapper} from "enzyme";
import React, { Component } from "react";
import SchemaBuilder from "../../../src/components/schema-builder/schema-builder";

let wrapper: ReactWrapper;
beforeEach(() => {
    wrapper = mount(<SchemaBuilder elements={{}} types={{}} />)
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
    describe("JSON Schema Viewer", () => {
    
        it("should display example Types Schema correctly", () => {
            const component = mount(<SchemaBuilder elements={{}} types={{
                "test name":
                    {
                        "description": "test description",
                        "class":"test class"
                    },
            }} />)
            const expectedResult: object = 
            
            {"types":{
                "test name":
                    {
                        "description": "test description",
                        "class":"test class"
                    },
            }}
            expect(component.find("div#json-schema-viewer").text()).toEqual(expectedResult);
        });
        it("should append another type to existing types schema correctly", () => {
            const component = mount(<SchemaBuilder elements={{}} types={{
                "test name":
                    {
                        "description": "test description",
                        "class":"test class"
                    },
            }} />)
            const expectedResult: object = 
            
            {"types":{
                "test name":
                    {
                        "description": "test description",
                        "class":"test class"
                    },
            }}
            expect(component.find("div#json-schema-viewer").text()).toEqual(expectedResult);
        });
    })
})