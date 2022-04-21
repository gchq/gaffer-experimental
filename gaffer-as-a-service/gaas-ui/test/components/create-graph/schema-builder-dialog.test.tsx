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

import React from "react";
import { mount, ReactWrapper } from "enzyme";
import SchemaBuilderDialog from "../../../src/components/create-graph/schema-builder-dialog";

let wrapper: ReactWrapper;
const onCreateSchemaMockCallBack = jest.fn();

beforeEach(() => {
    wrapper = mount(
        <SchemaBuilderDialog
            elementsSchema={{
                edges: {
                    TestEdge: {
                        description: "test",
                        source: "A",
                        destination: "B",
                        directed: "true",
                    },
                },
                entities: {
                    TestEntity: {
                        description: "test description",
                        vertex: "B",
                    },
                },
            }}
            onCreateSchema={onCreateSchemaMockCallBack}
            typesSchema={{
                types: {
                    name: {
                        description: "test description",
                        class: "test.class",
                    },
                },
            }}
        />
    );
});
afterEach(() => {
    wrapper.unmount();
});
describe("Schema builder Dialog UI Component", () => {
    describe("Schema builder button", () => {
        it("should have a schema builder button", () => {
            const schemaBuilderButton = wrapper.find("button#schema-builder-button");

            expect(schemaBuilderButton.text()).toBe("Schema Builder");
        });
        it("should open dialog on schema builder button press", () => {
            wrapper.find("button#schema-builder-button").simulate("click");
            const addTypeButton = wrapper.find("button#add-type-dialog-button");
            expect(addTypeButton.text()).toBe("Add Type");

            const addEdgeButton = wrapper.find("button#add-edge-dialog-button");
            expect(addEdgeButton.text()).toBe("Add Edge");

            const addEntityButton = wrapper.find("button#add-entity-dialog-button");
            expect(addEntityButton.text()).toBe("Add Entity");
        });
    });
});
