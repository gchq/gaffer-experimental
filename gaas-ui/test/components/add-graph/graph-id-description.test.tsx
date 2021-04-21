import { mount, ReactWrapper } from "enzyme";
import GraphIdDescriptionInput from "../../../src/components/add-graph/graph-id-description";
import React from "react";

const graphIdMockCallBack = jest.fn();
const descriptionMockCallBack = jest.fn();

const component: ReactWrapper = mount(
  <GraphIdDescriptionInput
    graphIdValue="display-id"
    descriptionValue="Inputted description here"
    onChangeGraphId={graphIdMockCallBack}
    onChangeDescription={descriptionMockCallBack}
  />
);

afterEach(() => jest.resetAllMocks());

describe("Graph ID & Description", () => {
  it("should populate input value with graphIdValue prop", () => {
    expect(component.find("input#graph-id").props().value).toBe("display-id");
  });
  it("should populate input value with graphIdValue prop", () => {
    expect(component.find("textarea#graph-description").props().value).toBe("Inputted description here");
  });
  it("should call back with graph id when character inputted", () => {
    component.find("input#graph-id").simulate("change", {
      target: { value: "id" },
    });

    expect(graphIdMockCallBack).toHaveBeenLastCalledWith("id");
  });
  it("should call back with graph id when character inputted", () => {
    component.find("textarea#graph-description").simulate("change", {
      target: { value: "Some description" },
    });

    expect(descriptionMockCallBack).toHaveBeenLastCalledWith(
      "Some description"
    );
  });
});
