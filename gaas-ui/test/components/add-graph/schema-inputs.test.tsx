import { mount, ReactWrapper } from "enzyme";
import React from "react";
import SchemaInput from "../../../src/components/add-graph/schema-inputs";

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
    inputElementsJson({ edges: {test: "test1"}, entities: {} });
    expect(elementsMockCallBack).toHaveBeenLastCalledWith(
      JSON.stringify({ edges: {test: "test1"}, entities: {} })
    );
  });
  it("should pass inputted value in to TextField to be displayed", () => {
    const expected = JSON.stringify({ edges: {}, entities: {} });

    expect(component.find("textarea#schema-elements-input").props().value).toBe(
      expected
    );
  });
});

describe("Types Schema", () => {
  it("should callback types json when inputted", () => {
    inputTypesJson({ types: "Some types" });

    expect(elementsMockCallBack).toHaveBeenLastCalledWith(
      JSON.stringify({ types: "Some types" })
    );
  });
  it("should pass inputted value in to TextField to be displayed", () => {
    const expected = JSON.stringify({ types: {} });

    expect(component.find("textarea#schema-types-input").props().value).toBe(
      expected
    );
  });
});

describe("Elements Schema Error Handling", ()=>{
  it("should not display errors when input is empty",()=>{
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
  it("should display errors when invalid JSON",()=>{
    const component = mount(
      <SchemaInput
        hide={hide}
        elementsValue={"Not json"}
        onChangeElementsSchema={elementsMockCallBack}
        typesSchemaValue={JSON.stringify({ invalid : {} })}
        onChangeTypesSchema={elementsMockCallBack}
      />
    );

    expect(component.find("p#schema-types-helper-text").text()).toBe("Types Schema does not contain property types, [\"invalid\"] are invalid Types schema root properties");
  });
})

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
