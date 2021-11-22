import { mount, ReactWrapper } from "enzyme";
import AddEntity from "../../../src/components/schema-builder/add-entity";
import React from "react";

let wrapper: ReactWrapper;
const onAddEntityMockCallBack = jest.fn();
beforeEach(() => {
    wrapper = mount(
        <AddEntity onAddEntity={onAddEntityMockCallBack} types={["typeOne", "typeTwo", "typeThree", "typeFour"]} />
    );
});
afterEach(() => {
    wrapper.unmount();
});

describe("Add Entity UI Component", () => {
    describe("Add Entity Inputs", () => {
        it("should have a Entity Name input", () => {
            const entityNameInputField = wrapper.find("input#entity-name-input");

            expect(entityNameInputField.props().name).toBe("Entity Name");
        });
        it("should display error message when invalid entity name entered", () => {
            wrapper.find("input#entity-name-input").simulate("change", {
                target: { value: "entity name 1" },
            });

            expect(wrapper.find("p#entity-name-input-helper-text").text()).toBe("Entity name can only contain letters");
        });
        it("should have a Entity Description input", () => {
            const descriptionInputField = wrapper.find("input#entity-description-input");

            expect(descriptionInputField.props().name).toBe("Entity Description");
        });
        it("should display error message when invalid entity description entered", () => {
            wrapper.find("input#entity-description-input").simulate("change", {
                target: { value: "Entity description +" },
            });

            expect(wrapper.find("p#entity-description-input-helper-text").text()).toBe(
                "Entity description can only contain alpha numeric letters and spaces"
            );
        });
        it("should have a Entity Vertex select", () => {
            const vertexSelect = wrapper.find("label#entity-vertex-select-label");

            expect(vertexSelect.text()).toBe("Vertex *");
        });

        it("should have an Entity Property input field", () => {
            const propertyInputField = wrapper.find("textarea#entity-properties-input");

            expect(propertyInputField.props().name).toBe("Entity Properties");
        });

        //TODO: properties, group by
    });
    describe("Add Entity Button", () => {
        it("should have an Add Entity button", () => {
            const addEntityButton = wrapper.find("button#add-entity-button");

            expect(addEntityButton.text()).toBe("Add Entity");
        });
    });

    describe("Disable | Enable Add Entity Button", () => {
        it("should be disabled when Entity Name field is empty", () => {
            addEntityDescription("test entity description");
            selectVertex("typeOne");

            expect(wrapper.find("button#add-entity-button").props().disabled).toBe(true);
        });

        it("should be disabled when Entity description field is empty", () => {
            addEntityName("testEntity");
            selectVertex("typeOne");

            expect(wrapper.find("button#add-entity-button").props().disabled).toBe(true);
        });

        it("should be disabled when Entity Name, description and Vertex fields are empty", () => {
            selectVertex("typeOne");
            expect(wrapper.find("button#add-entity-button").props().disabled).toBe(true);
        });

        it("should be enabled when Entity name, description and vertex fields are not empty", () => {
            addEntityName("testEntity");
            addEntityDescription("test entity description");
            selectVertex("typeOne");
            expect(wrapper.find("button#add-entity-button").props().disabled).toBe(false);
        });
    });

    describe("On Add Entity", () => {
        it("should callback with an entity object when a new entity has been added", async () => {
            const expectedResult: object = {
                testEntity: {
                    description: "test entity description",
                    vertex: "typeOne",
                    properties: {},
                },
            };

            addEntityName("testEntity");
            addEntityDescription("test entity description");
            selectVertex("typeOne");
            await clickAddEntity();

            expect(onAddEntityMockCallBack).toHaveBeenLastCalledWith(expectedResult);
        });
    });
    describe("Vertex Dropdown", () => {
        it("Should allow a valid type to be selected", () => {
            selectVertex("typeOne");
            expect(wrapper.find("div#entity-vertex-formcontrol").find("input").props().value).toBe("typeOne");
        });
        it("should not allow an invalid type to be selected", () => {
            selectVertex("typeFive");
            expect(wrapper.find("div#entity-vertex-formcontrol").find("input").props().value).toBe("");
        });
        it("No type is selected", () => {
            selectVertex("");
            expect(wrapper.find("div#entity-vertex-formcontrol").find("input").props().value).toBe("");
        });
    });
});

function selectVertex(vertex: string) {
    wrapper
        .find("div#entity-vertex-formcontrol")
        .find("input")
        .simulate("change", {
            target: { value: vertex },
        });
}

function addEntityName(name: string) {
    const nameInputField = wrapper.find("input#entity-name-input");
    nameInputField.simulate("change", {
        target: { value: name },
    });
}

function addEntityDescription(description: string) {
    const descriptionInputField = wrapper.find("input#entity-description-input");
    descriptionInputField.simulate("change", {
        target: { value: description },
    });
}

function clickAddEntity() {
    const addTypeButton = wrapper.find("button#add-entity-button");
    addTypeButton.simulate("click");
}
