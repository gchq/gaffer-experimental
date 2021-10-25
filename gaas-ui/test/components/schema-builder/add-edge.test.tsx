import {mount, ReactWrapper} from "enzyme";
import AddEdge from "../../../src/components/schema-builder/add-edge";
import React from "react";

let wrapper: ReactWrapper;
const onAddEdgeMockCallBack = jest.fn();
beforeEach(() => {
    wrapper = mount(<AddEdge onAddEdge={onAddEdgeMockCallBack}
                             types={["typeOne", "typeTwo", "typeThree", "typeFour"]}/>);
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
                target: {value: "edge name 1"}
            });

            expect(wrapper.find("p#edge-name-input-helper-text").text()).toBe("Edge name can only contain letters");
        });
        it("should have a Description input field", () => {
            const descriptionInputField = wrapper.find("input#edge-description-input");

            expect(descriptionInputField.props().name).toBe("Edge Description");
        });
        it("should display error message when invalid description entered", () => {
            wrapper.find("input#edge-description-input").simulate("change", {
                target: {value: "Edge description +"}
            });

            expect(wrapper.find("p#edge-description-input-helper-text").text()).toBe("Edge description can only contain alpha numeric letters and spaces");
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

        //TODO: Properties and Group by

    });
    describe("Add Edge Button", () => {
        it("should have an Add Edge button", () => {
            const addEdgeButton = wrapper.find("button#add-edge-button");

            expect(addEdgeButton.text()).toBe("Add Edge");
        });
    });
    describe("On Add Edge", () => {
        it("should callback with an edge object when a new edge has been added", async() => {
            const expectedResult: object =
                {
                    "testEdge":
                        {
                            "description": "test edge description",
                            "source": "typeOne",
                            "destination": "typeTwo",
                            "directed": "true"
                        },
                };

            addEdgeName("testEdge");
            addEdgeDescription("test edge description");
            selectSource("typeOne");
            selectDestination("typeTwo");
            selectDirected("true");
            await clickAddEdge();

            expect(onAddEdgeMockCallBack).toHaveBeenLastCalledWith(expectedResult);
        });
    });
    describe("Source Dropdown", () => {
        it("Should allow a valid type to be selected", () => {
            selectSource("typeOne");
            expect(wrapper.find("div#edge-source-formcontrol")
                .find("input").props().value).toBe("typeOne");
        });
        it("should not allow an invalid type to be selected", () => {
            selectSource("typeFive");
            expect(wrapper.find("div#edge-source-formcontrol")
                .find("input").props().value).toBe("");
        });
    });
    describe("Destination Dropdown", () => {
        it("Should allow a valid type to be selected", () => {
            selectDestination("typeOne");
            expect(wrapper.find("div#edge-destination-formcontrol")
                .find("input").props().value).toBe("typeOne");
        });
        it("should not allow an invalid type to be selected", () => {
            selectDestination("typeFive");
            expect(wrapper.find("div#edge-destination-formcontrol")
                .find("input").props().value).toBe("");
        });
    });
    describe("Directed Dropdown", () => {
        it("Should allow true to be selected", () => {
            selectDirected("true");
            expect(wrapper.find("div#edge-directed-formcontrol")
                .find("input").props().value).toBe("true");
        });
        it("should not allow false to be selected", () => {
            selectDirected("false");
            expect(wrapper.find("div#edge-directed-formcontrol")
                .find("input").props().value).toBe("false");
        });
    });

});

function addEdgeName(name: string) {
    const nameInputField = wrapper.find("input#edge-name-input");
    nameInputField.simulate("change", {
        target: {value: name},
    });
}

function addEdgeDescription(description: string) {
    const descriptionInputField = wrapper.find("input#edge-description-input");
    descriptionInputField.simulate("change", {
        target: {value: description},
    });
}

function selectSource(source: string) {
    wrapper
        .find("div#edge-source-formcontrol")
        .find("input")
        .simulate("change", {
            target: {value: source},
        });
}

function selectDestination(destination: string) {
    wrapper
        .find("div#edge-destination-formcontrol")
        .find("input")
        .simulate("change", {
            target: {value: destination},
        });
}

function selectDirected(directed: string) {
    wrapper
        .find("div#edge-directed-formcontrol")
        .find("input")
        .simulate("change", {
            target: {value: directed},
        });
}

function clickAddEdge() {
    const addTypeButton = wrapper.find("button#add-edge-button");
    addTypeButton.simulate("click");
}
