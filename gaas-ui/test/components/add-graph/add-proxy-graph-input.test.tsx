import { mount, ReactWrapper } from "enzyme";
import React from "react";
import AddProxyGraphInput from "../../../src/components/add-graph/add-proxy-graph-input";
import { Graph } from "../../../src/domain/graph";
import { GraphType } from "../../../src/domain/graph-type";

let component: ReactWrapper;
const onChangeProxyURLMockCallback = jest.fn();
const onClickAddProxyMockCallback = jest.fn();

beforeEach(() => {
  component = mount(
    <AddProxyGraphInput
      hide={false}
      proxyURLValue={"http://url.value"}
      onChangeProxyURL={onChangeProxyURLMockCallback}
      onClickAddProxyGraph={onClickAddProxyMockCallback}
    />
  );
});

afterEach(() => {
  component.unmount();
});

describe("GraphsTable UI Component", () => {
  it("Should be visible when hide is false", () => {
    expect(component.find("div#graphs-table").length).toBe(1);
  });
  it("Should call the onChange function when the proxy url texfield receives an input", () => {
    inputProxyURL("http://input.test.url");

    expect(onChangeProxyURLMockCallback).toHaveBeenCalledWith(
      "http://input.test.url"
    );
  });
  it("Should set the value of proxy url correctly", () => {
    expect(
      component.find("div#proxy-url-grid").find("input").props().value
    ).toBe("http://url.value");
  });
  it("should call onClick with new Proxy Graph and onChange with empty string to reset value", () => {
    clickAddProxy();

    const expected = new Graph(
      "http://url.value-graph",
      "Proxy Graph",
      "http://url.value",
      "n/a",
      GraphType.PROXY_GRAPH
    );
    expect(onClickAddProxyMockCallback).toHaveBeenCalledWith(expected);
    expect(onChangeProxyURLMockCallback).toHaveBeenCalledWith("");
  });
});

describe("Hide Component", () => {
  const component = mount(
    <AddProxyGraphInput
      hide={true}
      proxyURLValue={""}
      onChangeProxyURL={onChangeProxyURLMockCallback}
      onClickAddProxyGraph={onClickAddProxyMockCallback}
    />
  );
  
  it("Should not be visible when hide is true", () => {
    expect(component.find("div#graphs-table").length).toBe(0);
  });
});

describe("Disable Add Proxy Button", () => {
  const component = mount(
    <AddProxyGraphInput
      hide={false}
      proxyURLValue={""}
      onChangeProxyURL={onChangeProxyURLMockCallback}
      onClickAddProxyGraph={onClickAddProxyMockCallback}
    />
  );

  it("should disable when url input value is empty string", () => {
    expect(component.find("button#add-new-proxy-button").props().disabled).toBe(
      true
    );
  });
});

function inputProxyURL(url: string) {
  component
    .find("div#proxy-url-grid")
    .find("input")
    .simulate("change", {
      target: { value: url },
    });
}
function clickAddProxy() {
  component.find("button#add-new-proxy-button").simulate("click");
}
