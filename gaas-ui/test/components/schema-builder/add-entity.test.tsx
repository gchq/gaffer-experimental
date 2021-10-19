import {mount, ReactWrapper} from "enzyme";
import AddEntity from "../../../src/components/schema-builder/add-entity";

let wrapper: ReactWrapper;
beforeEach(() => {
    wrapper = mount(<AddEntity/>);
});
afterEach(() => {
    wrapper.unmount();
});
describe("Add Entity UI Component", () => {
    describe("Add Entity Inputs", () => {
        it("should have a Entity Name input", () => {
            const entityNameInputField = wrapper.find("input#entity-name-input");

            expect(entityNameInputField.props().name).toBe("Entity Name")
        });
        it("should have a Entity Description input", () => {
            const descriptionInputField = wrapper.find("input#entity-description-input");

            expect(descriptionInputField.props().name).toBe("Entity Description")
        });
        it("should have a Entity Vertex select", () => {
            const vertexSelect = wrapper.find("label#entity-vertex-select-label");

            expect(vertexSelect.text()).toBe("Vertex")
        });

        //TODO: properties, group by
    });
    describe("Add Entity Button", () => {
        it("should have an Add Entity button", () => {
            const addEntityButton = wrapper.find("button#add-entity-button");

            expect(addEntityButton.text()).toBe("Add Entity");
        })
    })
})