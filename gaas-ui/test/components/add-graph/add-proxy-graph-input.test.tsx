import { mount, ReactWrapper } from "enzyme";
import { title } from "node:process";
import React from "react";
import AddProxyGraphInput from "../../../src/components/add-graph/add-proxy-graph-input";
import {GetGraphStatusRepo} from "../../../src/rest/repositories/get-graph-status-repo";
import { RestApiError } from "../../../src/rest/RestApiError";

jest.mock("../../../src/rest/repositories/get-graph-status-repo");

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
  component.unmount()
  jest.resetAllMocks();
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
 
});

describe("Error handling", () => {
  const component = mount(
    <AddProxyGraphInput
      hide={false}
      proxyURLValue={""}
      onChangeProxyURL={onChangeProxyURLMockCallback}
      onClickAddProxyGraph={onClickAddProxyMockCallback}
    />
  );
  it("Should not show error on render", () =>{
    expect(component.find("label#proxy-url-label").props().className).not.toContain("Mui-error");
    expect(component.find("p#proxy-url-helper-text").length).toBe(0);
  });

  it("Should show error on invalid unkown error", async () => {
    mockGetGraphStatusRepoToThrowError();
    const component = mount(
      <AddProxyGraphInput
        hide={false}
        proxyURLValue={"http://invalid"}
        onChangeProxyURL={onChangeProxyURLMockCallback}
        onClickAddProxyGraph={onClickAddProxyMockCallback}
      />
    );
    component.find("button#add-new-proxy-button").simulate("click");
    await component.update();
    await component.update();
    expect(component.find("label#proxy-url-label").props().className).toContain("Mui-error");
    expect(component.find("p#proxy-url-helper-text").text()).toBe("Invalid proxy URL");
    
  })
})

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
  it("should enable when url input value is valid URL", () => {
    const component = mount(
      <AddProxyGraphInput
        hide={false}
        proxyURLValue={"http://test.com"}
        onChangeProxyURL={onChangeProxyURLMockCallback}
        onClickAddProxyGraph={onClickAddProxyMockCallback}
      />
    );
    expect(component.find("button#add-new-proxy-button").props().disabled).toBe(
      false
    );
  });
  it("should disable when url input value is invalid URL", () => {
    const component = mount(
      <AddProxyGraphInput
        hide={false}
        proxyURLValue={"hp://test.com"}
        onChangeProxyURL={onChangeProxyURLMockCallback}
        onClickAddProxyGraph={onClickAddProxyMockCallback}
      />
    );
    expect(component.find("button#add-new-proxy-button").props().disabled).toBe(
      true
    );
  });
  it("should disable when url input value is empty", () => {
    const component = mount(
      <AddProxyGraphInput
        hide={false}
        proxyURLValue={""}
        onChangeProxyURL={onChangeProxyURLMockCallback}
        onClickAddProxyGraph={onClickAddProxyMockCallback}
      />
    );
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

function mockGetGraphStatusRepoToThrowError() {
  // @ts-ignore
  GetGraphStatusRepo.mockImplementationOnce(() => ({
      getStatus: () => new RestApiError("Server Error", "Invalid proxy URL"),
  }));
}
