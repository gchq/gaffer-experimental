//Implement Hidden() so this part of the form can get hidden

import { mount, ReactWrapper } from "enzyme";
import React from "react";
import SchemaInput from "../../../src/components/add-graph/schema-inputs";

//Types and elements on change part of this form
const elementsMockCallBack = jest.fn();

const component: ReactWrapper = mount(
  <SchemaInput
    elementsValue="display-id"
    onChangeElements={elementsMockCallBack}
  />
);

afterEach(() => jest.resetAllMocks());

describe("Schema input", ()=> {
    it("should callback elements json when inputted", () =>{
        inputElements({enities: "ds"});
        expect(elementsMockCallBack).toHaveBeenLastCalledWith(JSON.stringify({enities: "ds"}));
    });
})

function inputElements(elementsObject: object): void {
    component.find("textarea#schema-elements").simulate("change", {
      target: { value: JSON.stringify(elementsObject) },
    });
    //expect(component.find("textarea#schema-elements").props().value).toBe(JSON.stringify(elementsObject));
  }