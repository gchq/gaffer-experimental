import { mount, ReactWrapper } from "enzyme";
import React from "react";
import AddGraph from "../../../src/components/add-graph/AddGraph";
import { StoreType } from "../../../src/domain/store-type";
import { CreateGraphRepo, ICreateGraphConfig } from "../../../src/rest/repositories/create-graph-repo";
import {GetGraphStatusRepo} from "../../../src/rest/repositories/get-graph-status-repo";
import {RestApiError} from "../../../src/rest/RestApiError";

jest.mock("../../../src/rest/repositories/create-graph-repo");
jest.mock("../../../src/rest/repositories/get-graph-status-repo");
let wrapper: ReactWrapper;

beforeEach(() => (wrapper = mount(<AddGraph />)));

afterEach(() => {
  wrapper.unmount();
  jest.resetAllMocks();
});

describe("AddGraph UI component", () => {
  describe("Layout On Render", () => {
    it("Should have a Graph Id, Description, Store Type dropdown inputs", () => {
      const textfield = wrapper.find("input");
      expect(textfield.at(0).props().name).toBe("graph-id");
      const descriptionTextArea = wrapper.find("textarea#graph-description");
      expect(descriptionTextArea.props().name).toBe("graph-description");
      const select = wrapper.find("div#storetype-select-grid");
      expect(select.text()).toBe(
        "Store TypeMap StoreStore TypeSet to Map Store by default"
      );
    });
    it("should have icon button", () => {
      const fileButton = wrapper.find("button").at(0).find("svg");
      expect(fileButton).toHaveLength(1);
    });
    it("should have an elements text area", () => {
      const elementsTextfield = wrapper.find("textarea#schema-elements");
      expect(elementsTextfield.props().name).toBe("schema-elements");
    });
    it("should have a types text area", () => {
      const typesTextfield = wrapper.find("textarea#schema-types");
      expect(typesTextfield.props().name).toBe("schema-types");
    });
    it("should have a Submit button", () => {
      const submitButton = wrapper.find("button#add-new-graph-button").text();
      expect(submitButton).toBe("Add Graph");
    });
  });
  describe("When Federated StoreType Is Selected", () => {
    it("Should have a URL Input, Add Button & Graph Table when federated store is selected", () => {
      selectStoreType(StoreType.FEDERATED_STORE);

      const urlInput = wrapper.find("input#proxy-url");
      expect(urlInput.props().name).toBe("proxy-url");
      const addButton = wrapper.find("button#add-new-proxy-button");
      expect(addButton.text()).toBe("Add Proxy Graph");
      const graphTable = wrapper.find("table");
      expect(graphTable.text()).toBe("Graph IDDescriptionType No Graphs.");
    });
    it("Should disable the add proxy graph button when the proxy graph URL textfield is empty", () => {
      selectStoreType(StoreType.FEDERATED_STORE);

      const button = wrapper.find("button#add-new-proxy-button");
      expect(button.props().disabled).toEqual(true);
    });
    it("Should add a graph to the graphs table when a URL is entered and the Add proxy button is clicked", async () => {
      selectStoreType(StoreType.FEDERATED_STORE);
      mockGetGraphStatus("UP")
      inputProxyURL("http://test.graph.url");

      await clickAddProxy();

      const graphTable = wrapper.find("table");
      expect(graphTable.text()).toEqual(
        "Graph IDDescriptionType http://test.graph.url-graphProxy GraphProxy Graph"
      );
    });
    it("Should add a graph to the graphs table and display notification when url is valid", async () => {
      selectStoreType(StoreType.FEDERATED_STORE);
      mockGetGraphStatus("UP")
      inputProxyURL("http://test.graph.url");

      await clickAddProxy();
      await wrapper.update();

      expect(wrapper.find("div#notification-alert").text()).toBe(
          "Graph is valid"
      );
    });
    it("Should not add graph to the graphs table and display notification when url is invalid", async () => {
      selectStoreType(StoreType.FEDERATED_STORE);
      mockGetGraphStatusThrowsError(() => {
        throw new RestApiError("Not Found", "Resource not found");
      });
      inputProxyURL("test.graph.url");

      await clickAddProxy();
      await wrapper.update();

      expect(wrapper.find("div#notification-alert").text()).toBe(
          "Graph is invalid Not Found: Resource not found"
      );
    });
    it("Should select a graph in table", async () => {
      mockGetGraphStatus("UP");
      selectStoreType(StoreType.FEDERATED_STORE);
      inputProxyURL("https://www.testURL.com/");
      await clickAddProxy();
      inputProxyURL("https://www.testURL2.com/");
      await clickAddProxy();

      clickTableBodyCheckBox(0, false);

      expect(wrapper.find("table").find("input").at(1).props().checked).toBe(
        false
      );
    });
    it("Should allow all graphs in the table to be selected when the checkbox in the header is checked", async () => {
      mockGetGraphStatus("UP")
      selectStoreType(StoreType.FEDERATED_STORE);
      inputProxyURL("https://www.testURL.com/");
      await clickAddProxy();
      mockGetGraphStatus("UP")
      inputProxyURL("https://www.testURL2.com/");
      await clickAddProxy();

      clickTableHeaderCheckBox(true);

      const tableInputs = wrapper.find("table").find("input");
      expect(tableInputs.at(0).props().checked).toBe(true);
      expect(tableInputs.at(1).props().checked).toBe(true);
      expect(tableInputs.at(2).props().checked).toBe(true);
    });
    it("Should disable the submit graph button when no proxy stores are selected", () => {
      inputGraphId("test");
      inputDescription("test");
      selectStoreType(StoreType.FEDERATED_STORE);

      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(
        true
      );
    });
    it("Should uncheck all graphs in the table when the uncheck all button is clicked", async () => {
      mockGetGraphStatus("UP")
      selectStoreType(StoreType.FEDERATED_STORE);
      inputProxyURL("https://www.testURL.com/");
      await clickAddProxy();
      mockGetGraphStatus("UP")
      inputProxyURL("https://www.testURL2.com/");
      await clickAddProxy();

      clickTableHeaderCheckBox(true);
      clickTableHeaderCheckBox(false);

      const tableInputs = wrapper.find("table").find("input");
      expect(tableInputs.at(0).props().checked).toBe(false);
      expect(tableInputs.at(1).props().checked).toBe(false);
      expect(tableInputs.at(2).props().checked).toBe(false);
    });
    it("Should call AddGraphRepo with Federated Store Graph request params and display success message", async () => {
      const mock = jest.fn();
      mockAddGraphRepoWithFunction(mock);
      inputGraphId("OK Graph");
      inputDescription("test");

      selectStoreType(StoreType.FEDERATED_STORE);
      mockGetGraphStatus("UP")
      await inputProxyURL("https://www.testURL.com/");
      await clickAddProxy();

      await clickSubmit();
      //@ts-ignore
      await wrapper.update();
      await wrapper.update();

      const expectedConfig: ICreateGraphConfig = {
        proxyStores: [{ graphId: "https://www.testURL.com/-graph", url: "https://www.testURL.com/" }]
      }
      expect(mock).toHaveBeenLastCalledWith(
        "OK Graph",
        "test",
        StoreType.FEDERATED_STORE,
        expectedConfig,
      );
      expect(wrapper.find("div#notification-alert").text()).toBe(
        "OK Graph was successfully added"
      );
    });
  });
  describe("When Map Store Is Selected", ()=>{
    it("Should call AddGraphRepo with Map Store Graph request params and display success message", async () => {
      const mock = jest.fn();
      mockAddGraphRepoWithFunction(mock);
      
      inputGraphId("map-store-graph");
      inputDescription("Mappy description");
      selectStoreType(StoreType.MAPSTORE);
      inputElements(elements);
      inputTypes(types);

      clickSubmit();
      //@ts-ignore
      await wrapper.update();
      await wrapper.update();

      const expectedConfig: ICreateGraphConfig = {
        schema: { elements: elements, types: types },
      }
      expect(mock).toHaveBeenLastCalledWith("map-store-graph", "Mappy description", StoreType.MAPSTORE, expectedConfig);
      expect(wrapper.find("div#notification-alert").text()).toBe(
        "map-store-graph was successfully added"
      );
    });
  });
  describe("When Accumulo Store Is Selected", ()=>{
    it("Should call AddGraphRepo with Accumulo Store Graph request params and display success message", async () => {
      const mock = jest.fn();
      mockAddGraphRepoWithFunction(mock);
      
      inputGraphId("accumulo-graph");
      inputDescription("None");
      selectStoreType(StoreType.ACCUMULO);
      inputElements(elements);
      inputTypes(types);

      await clickSubmit();
      //@ts-ignore
      await wrapper.update();
      await wrapper.update();

      const expectedConfig: ICreateGraphConfig = {
        schema: { elements: elements, types: types },
      }
      expect(mock).toHaveBeenLastCalledWith("accumulo-graph", "None", StoreType.ACCUMULO, expectedConfig);
      expect(wrapper.find("div#notification-alert").text()).toBe(
        "accumulo-graph was successfully added"
      );
    });
  });
  describe("Dropzone behaviour", () => {
    it("should have an elements drop zone that accepts JSON files", () => {
      const dropZone = wrapper.find("div#elements-drop-zone").find("input");
      expect(dropZone.props().type).toBe("file");
      expect(dropZone.props().accept).toBe("application/json");
    });
    it("should have a types drop zone that accepts JSON files", () => {
      const dropZone = wrapper.find("div#types-drop-zone").find("input");
      expect(dropZone.props().type).toBe("file");
      expect(dropZone.props().accept).toBe("application/json");
    });
  });

  describe("Add Graph Button", () => {
    it("should be disabled when Graph Name and Graph Description fields are empty", () => {
      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(
        true
      );
    });
    it("should be disabled when Graph Name field is empty", () => {
      inputDescription("test");
      inputElements(elements);
      inputTypes(types);
      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(
        true
      );
    });
    it("should be disabled when Graph Description field is empty", () => {
      inputGraphId("test");
      inputElements(elements);
      inputTypes(types);
      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(
        true
      );
    });
    it("Should be enabled when Graph Name and Graph Description is not empty", () => {
      inputGraphId("test");
      inputDescription("test");
      inputElements(elements);
      inputTypes(types);
      selectStoreType(StoreType.MAPSTORE);
      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(
        false
      );
    });
    it("Should be enabled when Graph Name and Graph Description is not empty and Accumulo selected", () => {
      inputGraphId("test");
      inputDescription("test");
      inputElements(elements);
      inputTypes(types);
      selectStoreType(StoreType.ACCUMULO);
      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(
        false
      );
    });
    it("Should be disabled when federated selected and no proxy stores added", () => {
      inputGraphId("test");
      inputDescription("test");
      inputElements(elements);
      inputTypes(types);
      selectStoreType(StoreType.FEDERATED_STORE);
      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(
        true
      );
    });
    it("should be disabled when the elements field is empty", () => {
      inputGraphId("G");
      inputDescription("test");
      inputElements(elements);

      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(
        true
      );
    });
    it("should be disabled when the types field is empty", () => {
      inputGraphId("G");
      inputDescription("test");
      inputTypes(types);

      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(
        true
      );
    });
    it("should be disabled when MAP STORE selected and elements schema has error", () => {
      inputGraphId("G");
      inputDescription("test");
      selectStoreType(StoreType.MAPSTORE);
      inputElements({ invalid: "json" });
      inputTypes(types);

      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(
        true
      );
    });
    it("should be disabled when MAP STORE selected and types schema has error", () => {
      inputGraphId("G");
      inputDescription("test");
      selectStoreType(StoreType.MAPSTORE);
      inputElements(elements);
      inputTypes({ invalid: "json" });
      

      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(
        true
      );
    });
    it("should be disabled when the elements schema has error", () => {
      inputGraphId("G");
      inputDescription("test");
      selectStoreType(StoreType.ACCUMULO);
      inputElements({ invalid: "json" });
      inputTypes(types);

      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(
        true
      );
    });
    it("should be disabled when the types schema has error", () => {
      inputGraphId("G");
      inputDescription("test");
      selectStoreType(StoreType.ACCUMULO);
      inputElements(elements);
      inputTypes({ invalid: "json" });
      

      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(
        true
      );
    });
  });

  describe("On Submit Request", () => {
    it("should display success message in the NotificationAlert", async () => {
      mockAddGraphRepoWithFunction(() => {});
      inputGraphId("OK Graph");
      inputDescription("test");
      inputElements(elements);
      inputTypes(types);

      clickSubmit();
      //@ts-ignore
      await wrapper.update();
      await wrapper.update();

      expect(wrapper.find("div#notification-alert").text()).toBe(
        "OK Graph was successfully added"
      );
    });
  });

  function clickSubmit(): void {
    wrapper.find("button#add-new-graph-button").simulate("click");
  }
  function inputGraphId(graphId: string): void {
    wrapper.find("input#graph-id").simulate("change", {
      target: { value: graphId },
    });
  }
  function selectStoreType(storeType: StoreType) {
    wrapper
      .find("div#storetype-formcontrol")
      .find("input")
      .simulate("change", {
        target: { value: storeType },
      });
  }
  function inputProxyURL(url: string) {
    wrapper
      .find("div#proxy-url-grid")
      .find("input")
      .simulate("change", {
        target: { value: url },
      });
  }
  function clickAddProxy() {
    wrapper.find("button#add-new-proxy-button").simulate("click");
  }
  function clickTableBodyCheckBox(row: number, check: boolean) {
    wrapper
      .find("table")
      .find("tbody")
      .find("input")
      .at(row)
      .simulate("change", {
        target: { checked: check },
      });
  }
  function clickTableHeaderCheckBox(check: boolean) {
    wrapper
      .find("table")
      .find("thead")
      .find("input")
      .simulate("change", {
        target: { checked: check },
      });
  }
  function inputDescription(description: string): void {
    wrapper.find("textarea#graph-description").simulate("change", {
      target: { value: description },
    });
    expect(wrapper.find("textarea#graph-description").props().value).toBe(
      description
    );
  }
  function inputElements(elementsObject: object): void {
    wrapper.find("textarea#schema-elements").simulate("change", {
      target: { value: JSON.stringify(elementsObject) },
    });
    expect(wrapper.find("textarea#schema-elements").props().value).toBe(
      JSON.stringify(elementsObject)
    );
  }

  function inputTypes(typesObject: object): void {
    wrapper.find("textarea#schema-types").simulate("change", {
      target: { value: JSON.stringify(typesObject) },
    });
    expect(wrapper.find("textarea#schema-types").props().value).toBe(
      JSON.stringify(typesObject)
    );
  }

  function mockAddGraphRepoWithFunction(f: () => void): void {
    // @ts-ignore
    CreateGraphRepo.mockImplementationOnce(() => ({
      create: f,
    }));
  }
  function mockGetGraphStatus(status: string): void {
    // @ts-ignore
    GetGraphStatusRepo.mockImplementationOnce(() => ({
      getStatus: () =>
          new Promise((resolve, reject) => {
            resolve(status);
          }),
    }));
  }function mockGetGraphStatusThrowsError(f: () => void): void {
    // @ts-ignore
    GetGraphStatusRepo.mockImplementationOnce(() => ({
      getStatus: f,
    }));
  }
});

const elements = {
  entities: {
    Cardinality: {
      description: "An entity that is added to every vertex representing the connectivity of the vertex.",
      vertex: "anyVertex",
      properties: {
        edgeGroup: "set",
        hllp: "hllp",
        count: "count.long",
      },
      groupBy: ["edgeGroup"],
    },
  },
  edges: {
    RoadUse: {
      description: "A directed edge representing vehicles moving from junction A to junction B.",
      source: "junction",
      destination: "junction",
      directed: "true",
      properties: {
        startDate: "date.earliest",
        endDate: "date.latest",
        count: "count.long",
        countByVehicleType: "counts.freqmap",
      },
    },
    groupBy: ["startDate", "endDate"],
  },
};

const types = {
  types: {
    "count.long": {
      description: "A long count that must be greater than or equal to 0.",
      class: "java.lang.Long",
      validateFunctions: [
        {
          class: "uk.gov.gchq.koryphe.impl.predicate.IsMoreThan",
          orEqualTo: true,
          value: {
            "java.lang.Long": 0,
          },
        },
      ],
      aggregateFunction: {
        class: "uk.gov.gchq.koryphe.impl.binaryoperator.Sum",
      },
      serialiser: {
        class: "uk.gov.gchq.gaffer.sketches.clearspring.cardinality.serialisation.HyperLogLogPlusSerialiser",
      },
    },
  },
};
