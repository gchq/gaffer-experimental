import { mount, ReactWrapper } from "enzyme";
import React from "react";
import { act } from "react-dom/test-utils";
import AddProxyGraphInput from "../../../src/components/create-graph/add-proxy-graph-input";
import { Graph } from "../../../src/domain/graph";
import { GraphType } from "../../../src/domain/graph-type";
import { StoreType } from "../../../src/domain/store-type";
import { GetGraphDetailsRepo } from "../../../src/rest/repositories/get-graph-details-repo";
import { GetGraphStatusRepo } from "../../../src/rest/repositories/get-graph-status-repo";
import { RestApiError } from "../../../src/rest/RestApiError";

jest.mock("../../../src/rest/repositories/get-graph-details-repo");
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
  component.unmount();
  jest.resetAllMocks();
});

describe("GraphsTable UI Component", () => {
  it("Should be visible when hide is false", () => {
    expect(component.find("div#graphs-table").length).toBe(1);
  });
  it("Should call the onChange function when the proxy url texfield receives an input", () => {
    inputProxyURL("http://input.test.url");

    expect(onChangeProxyURLMockCallback).toHaveBeenCalledWith("http://input.test.url");
  });
  it("Should set the value of proxy url correctly", () => {
    expect(component.find("div#proxy-url-grid").find("input").props().value).toBe("http://url.value");
  });
});

describe("Success & Error handling Adding Proxy Graph", () => {
  const component = mount(
    <AddProxyGraphInput
      hide={false}
      proxyURLValue={""}
      onChangeProxyURL={onChangeProxyURLMockCallback}
      onClickAddProxyGraph={onClickAddProxyMockCallback}
    />
  );
  it("Should not show error on render", () => {
    expect(component.find("label#proxy-url-label").props().className).not.toContain("Mui-error");
    expect(component.find("p#proxy-url-helper-text").length).toBe(0);
  });

  it("Should show error on invalid unknown error", async () => {
    mockGetGraphStatusRepoToThrowError();
    const component = mount(
      <AddProxyGraphInput
        hide={false}
        proxyURLValue={"http://invalid"}
        onChangeProxyURL={onChangeProxyURLMockCallback}
        onClickAddProxyGraph={onClickAddProxyMockCallback}
      />
    );

    clickAddProxy(component);

    expect(component.find("label#proxy-url-label").props().className).toContain("Mui-error");
    expect(component.find("p#proxy-url-helper-text").text()).toBe(
      "A Graph does not exist at the base URL: http://invalid"
    );
  });

  it("Should not turn input box red when User begins to enter correct URL before submitting", async () => {
    const component = mount(
      <AddProxyGraphInput
        hide={false}
        proxyURLValue={"htt"}
        onChangeProxyURL={onChangeProxyURLMockCallback}
        onClickAddProxyGraph={onClickAddProxyMockCallback}
      />
    );

    expect(component.find("label#proxy-url-label").props().className).not.toContain("Mui-error");
    expect(component.find("p#proxy-url-helper-text").length).toBe(0);
  });

  it("Should clear existing error helper text when valid Graph URL entered", () => {
    mockGetGraphStatusRepoToThrowError();
    const component = mount(
      <AddProxyGraphInput
        hide={false}
        proxyURLValue={"http://some-url"}
        onChangeProxyURL={onChangeProxyURLMockCallback}
        onClickAddProxyGraph={onClickAddProxyMockCallback}
      />
    );

    clickAddProxy(component);

    expect(component.find("label#proxy-url-label").props().className).toContain("Mui-error");
    expect(component.find("p#proxy-url-helper-text").text()).toBe(
      "A Graph does not exist at the base URL: http://some-url"
    );

    inputProxyBaseURL(component, "http://another-url");

    expect(component.find("label#proxy-url-label").props().className).not.toContain("Mui-error");
    expect(component.find("p#proxy-url-helper-text").length).toBe(0);
  });

  it("Should display Graph Is Down error when GraphStatusRepo returns DOWN", async () => {
    mockGetGraphStatusRepoIsSuccessfulAndReturns("DOWN");
    const component = mount(
      <AddProxyGraphInput
        hide={false}
        proxyURLValue={"http://some-url"}
        onChangeProxyURL={onChangeProxyURLMockCallback}
        onClickAddProxyGraph={onClickAddProxyMockCallback}
      />
    );
    waitForComponentToRender(component);

    clickAddProxy(component);
    await component.update();
    await component.update();

    expect(component.find("label#proxy-url-label").props().className).toContain("Mui-error");
    expect(component.find("p#proxy-url-helper-text").text()).toBe(
      "Graph at the base URL: http://some-url is down"
    );
  });

  it("Should still add ProxyGraph and call OnClickAddProxy when GraphDetailsRepo fails", async () => {
    mockGetGraphStatusRepoIsSuccessfulAndReturns("UP");
    mockGetGraphDetailsRepoToThrowError();
    const component = mount(
      <AddProxyGraphInput
        hide={false}
        proxyURLValue={"http://ok-url"}
        onChangeProxyURL={onChangeProxyURLMockCallback}
        onClickAddProxyGraph={onClickAddProxyMockCallback}
      />
    );
    waitForComponentToRender(component);

    clickAddProxy(component);
    await component.update();
    await component.update();

    const expected: Graph = new Graph("http://ok-url-graph", "n/a", "http://ok-url", "UP", StoreType.PROXY_STORE, GraphType.PROXY_GRAPH)
    expect(onClickAddProxyMockCallback).toHaveBeenLastCalledWith(expected);
  });

  it("Should add ProxyGraph and call OnClickAddProxy with real description when both Repos successful", async () => {
    mockGetGraphStatusRepoIsSuccessfulAndReturns("UP");
    mockGetGraphDetailsRepoIsSuccessfulAndReturns("graph-id","This graph is good");
    const component = mount(
      <AddProxyGraphInput
        hide={false}
        proxyURLValue={"http://all-good-url.app"}
        onChangeProxyURL={onChangeProxyURLMockCallback}
        onClickAddProxyGraph={onClickAddProxyMockCallback}
      />
    );
    waitForComponentToRender(component);

    clickAddProxy(component);
    await component.update();
    await component.update();
    await component.update();
    await component.update();

    const expected: Graph = new Graph("http://all-good-url.app-graph", "This graph is good", "http://all-good-url.app", "UP", StoreType.PROXY_STORE, GraphType.PROXY_GRAPH)
    expect(onClickAddProxyMockCallback).toHaveBeenCalledWith(expected);
    expect(component.find("label#proxy-url-label").props().className).not.toContain("Mui-error");
    expect(component.find("p#proxy-url-helper-text").text()).toBe(
      "Successfully added Graph at http://all-good-url.app"
    );
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
  it("should enable when url input value is valid URL", () => {
    const component = mount(
      <AddProxyGraphInput
        hide={false}
        proxyURLValue={"http://test.com"}
        onChangeProxyURL={onChangeProxyURLMockCallback}
        onClickAddProxyGraph={onClickAddProxyMockCallback}
      />
    );

    expect(component.find("button#add-new-proxy-button").props().disabled).toBe(false);
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

    expect(component.find("button#add-new-proxy-button").props().disabled).toBe(true);
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

    expect(component.find("button#add-new-proxy-button").props().disabled).toBe(true);
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

function inputProxyBaseURL(component: ReactWrapper, url: string) {
  component
    .find("div#proxy-url-grid")
    .find("input")
    .simulate("change", {
      target: { value: url },
    });
}

function clickAddProxy(component: ReactWrapper) {
  component.find("button#add-new-proxy-button").simulate("click");
}

function mockGetGraphStatusRepoToThrowError() {
  // @ts-ignore
  GetGraphStatusRepo.mockImplementationOnce(() => ({
    getStatus: () => {
      throw new RestApiError("Server Error", "Invalid proxy URL");
    },
  }));
}

function mockGetGraphDetailsRepoToThrowError() {
  // @ts-ignore
  GetGraphDetailsRepo.mockImplementationOnce(() => ({
    getDescription: () => {
      throw new RestApiError("Server Error", "Invalid proxy URL");
    },
    getGraphId: () => {
      throw new RestApiError("Server Error", "Invalid proxy URL");
    },
  }));
}

function mockGetGraphStatusRepoIsSuccessfulAndReturns(status: string) {
  // @ts-ignore
  GetGraphStatusRepo.mockImplementationOnce(() => ({
    getStatus: () =>
      new Promise((resolve, reject) => {
        resolve(status);
      }),
  }));
}

function mockGetGraphDetailsRepoIsSuccessfulAndReturns(graphId: string,description: string) {
  // @ts-ignore
  GetGraphDetailsRepo.mockImplementationOnce(() => ({
    getDescription: () =>
      new Promise((resolve, reject) => {
        resolve(description);
      }),
    getGraphId: () =>
      new Promise((resolve, reject) => {
        resolve(graphId);
      }),
  }));
}

async function waitForComponentToRender(wrapper: ReactWrapper) {
  // React forces test to use act(() => {}) when the component state is updated in some cases
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve));
    wrapper.update();
    wrapper.update();
  });
}
