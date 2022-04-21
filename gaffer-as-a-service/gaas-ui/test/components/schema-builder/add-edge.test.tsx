/*
 * Copyright 2021-2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */

import { mount, ReactWrapper } from "enzyme";
import AddEdge from "../../../src/components/schema-builder/add-edge";
import React from "react";
import { act } from "react-dom/test-utils";

let wrapper: ReactWrapper;
const onAddEdgeMockCallBack = jest.fn();
beforeEach(() => {
    wrapper = mount(
        <AddEdge onAddEdge={onAddEdgeMockCallBack} types={["typeOne", "typeTwo", "typeThree", "typeFour"]} />
    );
});
afterEach(() => {
    wrapper.unmount();
});

describe("Add Edge UI Component", () => {
    describe("Add Edge inputs", () => {
        it("should have an Edge Name input field", () => {
            const edgeNameInputField = wrapper.find("input#edge-name-input");

            expect(edgeNameInputField.props().name).toBe("Edge Name");
        });
        it("should display error message when invalid edge name entered", () => {
            wrapper.find("input#edge-name-input").simulate("change", {
                target: { value: "edge name 1" },
            });

            expect(wrapper.find("p#edge-name-input-helper-text").text()).toBe("Edge name can only contain letters");
        });
        it("should have a Description input field", () => {
            const descriptionInputField = wrapper.find("input#edge-description-input");

            expect(descriptionInputField.props().name).toBe("Edge Description");
        });
        it("should display error message when invalid description entered", () => {
            wrapper.find("input#edge-description-input").simulate("change", {
                target: { value: "Edge description +" },
            });

            expect(wrapper.find("p#edge-description-input-helper-text").text()).toBe(
                "Edge description can only contain alpha numeric letters and spaces"
            );
        });
        it("should have a Source select", () => {
            const sourceSelect = wrapper.find("label#edge-source-select-label");

            expect(sourceSelect.text()).toBe("Source *");
        });
        it("should have a Destination select", () => {
            const destinationSelect = wrapper.find("label#edge-destination-select-label");

            expect(destinationSelect.text()).toBe("Destination *");
        });
        it("should have a Directed select", () => {
            const directedSelect = wrapper.find("label#edge-directed-select-label");

            expect(directedSelect.text()).toBe("Directed *");
        });

        it("should have an Edge Property input field", () => {
            const propertyInputField = wrapper.find("textarea#edge-properties-input");

            expect(propertyInputField.props().name).toBe("Edge Properties");
        });
    });
    describe("Add Edge Button", () => {
        it("should have an Add Edge button", () => {
            const addEdgeButton = wrapper.find("button#add-edge-button");

            expect(addEdgeButton.text()).toBe("Add Edge");
        });
    });
    describe("Add Property Dialog", () => {
        it("should add the properties added in the property dialog to the properties textarea", async () => {
            await addEdgePropertyInDialog("propertyKey", "propertyValue");
            expect(wrapper.find("textarea#edge-properties-input").text()).toEqual('{"propertyKey":"propertyValue"}');
        });
    });
    describe("Add Groupby Dialog", () => {
        it("should add the groupby added in the groupby dialog to the groupby textarea", async () => {
            await addEdgeGroupbyInDialog("test");
            await addEdgeGroupbyInDialog("testM");
            expect(wrapper.find("textarea#edge-groupby-input").text()).toEqual('"test","testM",');
        });
    });
    describe("On Add Edge", () => {
        it("should callback with an edge object when a new edge has been added", async () => {
            const expectedResult: object = {
                testEdge: {
                    description: "test edge description",
                    source: "typeOne",
                    destination: "typeTwo",
                    directed: "true",
                    groupBy: ["test", "testM"],
                    properties: { propertyKey: "propertyValue" },
                },
            };

            await addEdgeName("testEdge");
            await addEdgeDescription("test edge description");

            await selectSource("typeOne");
            await selectDestination("typeTwo");
            await selectDirected("true");

            await addEdgePropertyInTextarea('{"propertyKey":"propertyValue"}');
            await addEdgeGroupbyInTextarea('"test","testM"');

            await clickAddEdge();

            expect(onAddEdgeMockCallBack).toHaveBeenLastCalledWith(expectedResult);
        });
        it("should callback with an edge object when a new edge has been added using property and groupby dialogs", async () => {
            const expectedResult: object = {
                testEdge: {
                    description: "test edge description",
                    source: "typeOne",
                    destination: "typeTwo",
                    directed: "true",
                    groupBy: ["test", "testM", "testV"],
                    properties: { propertyKey: "propertyValue" },
                },
            };

            await addEdgeName("testEdge");
            await addEdgeDescription("test edge description");

            await selectSource("typeOne");
            await selectDestination("typeTwo");
            await selectDirected("true");

            await addEdgePropertyInDialog("propertyKey", "propertyValue");
            await addEdgeGroupbyInDialog("test");
            await addEdgeGroupbyInDialog("testM");
            await addEdgeGroupbyInTextarea('"test","testM","testV"');

            await clickAddEdge();

            expect(onAddEdgeMockCallBack).toHaveBeenLastCalledWith(expectedResult);
        });
    });

    describe("Disable | Enable Add Edge Button", () => {
        it("should be disabled when Edge Name field is empty", async () => {
            await addEdgeDescription("test edge description");
            await selectSource("typeOne");
            await selectDestination("typeTwo");
            await selectDirected("true");

            expect(wrapper.find("button#add-edge-button").props().disabled).toBe(true);
        });

        it("should be disabled when Edge description field is empty", async () => {
            await addEdgeName("testEdge");
            await selectSource("typeOne");
            await selectDestination("typeTwo");
            await selectDirected("true");

            expect(wrapper.find("button#add-edge-button").props().disabled).toBe(true);
        });

        it("should be disabled when Edge Name, description fields are empty", async () => {
            await selectSource("typeOne");
            await selectDestination("typeTwo");
            await selectDirected("true");
            await expect(wrapper.find("button#add-edge-button").props().disabled).toBe(true);
        });

        it("should be disabled when Edge name, description, source, destination and directed fields are empty", () => {
            expect(wrapper.find("button#add-edge-button").props().disabled).toBe(true);
        });

        it("should be disabled when Edge directed field are is empty", async () => {
            await addEdgeName("testEdge");
            await addEdgeDescription("test edge description");
            await selectSource("typeOne");
            await selectDestination("typeTwo");
            expect(wrapper.find("button#add-edge-button").props().disabled).toBe(true);
        });

        it("should be disabled when Edge Source field are is empty", async () => {
            await addEdgeName("testEdge");
            await addEdgeDescription("test edge description");
            await selectDestination("typeTwo");
            await selectDirected("true");
            expect(wrapper.find("button#add-edge-button").props().disabled).toBe(true);
        });

        it("should be disabled when Edge Destination field are is empty", async () => {
            await addEdgeName("testEdge");
            await addEdgeDescription("test edge description");
            await selectSource("typeOne");
            await selectDirected("true");
            expect(wrapper.find("button#add-edge-button").props().disabled).toBe(true);
        });

        it("should be enabled when Edge name, description, source, destination and directed fields are not empty", async () => {
            await addEdgeName("testEdge");
            await addEdgeDescription("test edge description");
            await selectSource("typeOne");
            await selectDestination("typeTwo");
            await selectDirected("true");
            expect(wrapper.find("button#add-edge-button").props().disabled).toBe(false);
        });
    });

    describe("Source Dropdown", () => {
        it("Should allow a valid type to be selected", async () => {
            await selectSource("typeOne");
            expect(wrapper.find("div#edge-source-formcontrol").find("input").props().value).toBe("typeOne");
        });
        it("should not allow an invalid type to be selected", async () => {
            await selectSource("typeFive");
            expect(wrapper.find("div#edge-source-formcontrol").find("input").props().value).toBe("");
        });
    });
    describe("Destination Dropdown", () => {
        it("Should allow a valid type to be selected", async () => {
            await selectDestination("typeOne");
            expect(wrapper.find("div#edge-destination-formcontrol").find("input").props().value).toBe("typeOne");
        });
        it("should not allow an invalid type to be selected", async () => {
            await selectDestination("typeFive");
            expect(wrapper.find("div#edge-destination-formcontrol").find("input").props().value).toBe("");
        });
    });
    describe("Directed Dropdown", () => {
        it("Should allow true to be selected", async () => {
            await selectDirected("true");
            expect(wrapper.find("div#edge-directed-formcontrol").find("input").props().value).toBe("true");
        });
        it("should not allow false to be selected", async () => {
            await selectDirected("false");
            expect(wrapper.find("div#edge-directed-formcontrol").find("input").props().value).toBe("false");
        });
    });
});

async function addEdgeName(name: string) {
    await act(async () => {
        const nameInputField = wrapper.find("input#edge-name-input");
        nameInputField.simulate("change", {
            target: { value: name },
        });
    });
}

async function addEdgeDescription(description: string) {
    await act(async () => {
        const descriptionInputField = wrapper.find("input#edge-description-input");
        descriptionInputField.simulate("change", {
            target: { value: description },
        });
    });
}

async function selectSource(source: string) {
    wrapper
        .find("div#add-edge-inputs")
        .find("div#edge-source-formcontrol")
        .find("input")
        .simulate("change", {
            target: { value: source },
        });
}

async function selectDestination(destination: string) {
    wrapper
        .find("div#edge-destination-formcontrol")
        .find("input")
        .simulate("change", {
            target: { value: destination },
        });
}

async function selectDirected(directed: string) {
    wrapper
        .find("div#edge-directed-formcontrol")
        .find("input")
        .simulate("change", {
            target: { value: directed },
        });
}

async function addEdgePropertyInTextarea(property: string) {
    await act(() => {
        const propertyTextarea = wrapper.find("textarea#edge-properties-input");
        propertyTextarea.simulate("change", {
            target: { value: property },
        });
    });
}

async function addEdgePropertyInDialog(propertyKey: string, propertyValue: string) {
    await wrapper.find("button#add-properties-button").simulate("click");
    await act(() => {
        const propertyKeyInput = wrapper
            .find("div#add-properties-dialog")
            .find("div#add-property-inputs")
            .find("input#property-key-input");
        propertyKeyInput.simulate("change", {
            target: { value: propertyKey },
        });
        const propertyValueInput = wrapper
            .find("div#add-properties-dialog")
            .find("div#add-property-inputs")
            .find("input#property-value-input");
        propertyValueInput.simulate("change", {
            target: { value: propertyValue },
        });
    });
    await wrapper.find("button#add-property-button").simulate("click");
    await wrapper.find("button#close-add-properties-button").simulate("click");
}

async function addEdgeGroupbyInTextarea(groupBy: string) {
    await act(() => {
        const groupbyInputField = wrapper.find("textarea#edge-groupby-input");
        groupbyInputField.simulate("change", {
            target: { value: groupBy },
        });
    });
}

async function addEdgeGroupbyInDialog(groupBy: string) {
    await wrapper.find("button#add-groupby-button").simulate("click");
    await act(() => {
        const groupByInput = wrapper
            .find("div#add-groupby-dialog")
            .find("div#add-groupby-inputs")
            .find("input#groupby-key-input");
        groupByInput.simulate("change", {
            target: { value: groupBy },
        });
    });
    await wrapper
        .find("div#add-groupby-dialog")
        .find("div#add-groupby-inputs")
        .find("button#add-groupby-button-groupby-dialog")
        .simulate("click");
    await wrapper.find("button#close-add-groupby-button").simulate("click");
}

function clickAddEdge() {
    const addTypeButton = wrapper.find("button#add-edge-button");
    addTypeButton.simulate("click");
}
