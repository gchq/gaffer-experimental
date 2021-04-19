import { mount, ReactWrapper } from "enzyme";
import React from "react";
import SchemaInput from "../../../src/components/add-graph/schema-inputs";

//Types and elements on change part of this form
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
    expect(component.find("textarea#schema-elements").length).toBe(0);
    expect(component.find("textarea#schema-types").length).toBe(0);
  });
});

describe("Elements Schema", () => {
  it("should callback elements json when inputted", () => {
    inputElementsJson({ enities: "ds" });

    expect(elementsMockCallBack).toHaveBeenLastCalledWith(
      JSON.stringify({ enities: "ds" })
    );
  });
  it("should pass inputted value in to TextField to be displayed", () => {
    const expected = JSON.stringify({ edges: {}, entities: {} });

    expect(component.find("textarea#schema-elements").props().value).toBe(
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

    expect(component.find("textarea#schema-types").props().value).toBe(
      expected
    );
  });
});

function inputElementsJson(elementsObject: object): void {
  component.find("textarea#schema-elements").simulate("change", {
    target: { value: JSON.stringify(elementsObject) },
  });
}

function inputTypesJson(typesObject: object): void {
  component.find("textarea#schema-types").simulate("change", {
    target: { value: JSON.stringify(typesObject) },
  });
}
