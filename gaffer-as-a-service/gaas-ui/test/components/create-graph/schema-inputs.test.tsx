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
import React from "react";
import SchemaInput from "../../../src/components/create-graph/schema-inputs";

const elementsMockCallBack = jest.fn();
let component: ReactWrapper;
let hide = false;

beforeEach(() => {
    component = mount(
        <SchemaInput
            hide={hide}
            elementsValue={JSON.stringify({ edges: {}, entities: {} })}
            onChangeElementsSchema={elementsMockCallBack}
            typesSchemaValue={JSON.stringify({ types: {} })}
            onChangeTypesSchema={elementsMockCallBack}
        />
    );
});

afterEach(() => {
    jest.resetAllMocks();
    hide = false;
});

describe("Hide Elements/Types Schema Inputs", () => {
    hide = true;

    it("should hide both text areas when hide prop is true", () => {
        expect(component.find("textarea#schema-elements-input").length).toBe(0);
        expect(component.find("textarea#schema-types-input").length).toBe(0);
    });
});

describe("Elements Schema", () => {
    it("should callback elements json when inputted", () => {
        inputElementsJson({ edges: { test: "test1" }, entities: {} });
        expect(elementsMockCallBack).toHaveBeenLastCalledWith(
            JSON.stringify({ edges: { test: "test1" }, entities: {} })
        );
    });
    it("should pass inputted value in to TextField to be displayed", () => {
        const expected = JSON.stringify({ edges: {}, entities: {} });

        expect(component.find("textarea#schema-elements-input").props().value).toBe(expected);
    });
});

describe("Types Schema", () => {
    it("should callback types json when inputted", () => {
        inputTypesJson({ types: "Some types" });

        expect(elementsMockCallBack).toHaveBeenLastCalledWith(JSON.stringify({ types: "Some types" }));
    });
    it("should pass inputted value in to TextField to be displayed", () => {
        const expected = JSON.stringify({ types: {} });

        expect(component.find("textarea#schema-types-input").props().value).toBe(expected);
    });
});

describe("Elements Schema Error Handling", () => {
    it("should not display errors when input is empty", () => {
        const component = mount(
            <SchemaInput
                hide={hide}
                elementsValue={""}
                onChangeElementsSchema={elementsMockCallBack}
                typesSchemaValue={""}
                onChangeTypesSchema={elementsMockCallBack}
            />
        );
        expect(component.find("p#schema-types-helper-text").length).toBe(0);
    });
    it("should display errors when invalid JSON", () => {
        const component = mount(
            <SchemaInput
                hide={hide}
                elementsValue={"Not json"}
                onChangeElementsSchema={elementsMockCallBack}
                typesSchemaValue={"meep"}
                onChangeTypesSchema={elementsMockCallBack}
            />
        );

        expect(component.find("p#schema-types-helper-text").text()).toBe("Types Schema is not valid JSON");
        expect(component.find("p#schema-elements-helper-text").text()).toBe("Elements Schema is not valid JSON");
    });
});

function inputElementsJson(elementsObject: object): void {
    component.find("textarea#schema-elements-input").simulate("change", {
        target: { value: JSON.stringify(elementsObject) },
    });
}

function inputTypesJson(typesObject: object): void {
    component.find("textarea#schema-types-input").simulate("change", {
        target: { value: JSON.stringify(typesObject) },
    });
}
