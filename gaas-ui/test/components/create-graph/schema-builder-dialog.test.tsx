import React from "react";
import {mount, ReactWrapper} from "enzyme";
import SchemaBuilderDialog from "../../../src/components/create-graph/schema-builder-dialog";

let wrapper: ReactWrapper;
const onCreateSchemaMockCallBack = jest.fn();

beforeEach(() => {
    wrapper = mount(<SchemaBuilderDialog
        elementsSchema={
            {
                edges:
                    {
                        "TestEdge": {
                            "description": "test",
                            "source": "A",
                            "destination": "B",
                            "directed": "true"
                        },
                    },
                entities:
                    {
                        "TestEntity": {
                            "description": "test description",
                            "vertex": "B"
                        }
                    }
            }
        }

        onCreateSchema={onCreateSchemaMockCallBack}
        typesSchema={{
            types: {
                "name":
                    {
                        "description": "test description",
                        "class": "test.class"
                    },
            }
        }
        }
    />);
});
afterEach(() => {
    wrapper.unmount();
});
describe("Schema builder Dialog UI Component", () => {
    describe("Schema builder button", () => {
        it("should have a schema builder button", () => {
            const schemaBuilderButton = wrapper.find("button#schema-builder-button");

            expect(schemaBuilderButton.text()).toBe("Schema Builder");
        })
        it("should open dialog on schema builder button press", () => {
            wrapper.find("button#schema-builder-button").simulate("click");
            const addTypeButton = wrapper.find("button#add-type-button");
            expect(addTypeButton.text()).toBe("Add Type");

            const addEdgeButton = wrapper.find("button#add-edge-button");
            expect(addEdgeButton.text()).toBe("Add Edge");

            const addEntityButton = wrapper.find("button#add-entity-button");
            expect(addEntityButton.text()).toBe("Add Entity");
        })
    })

})
