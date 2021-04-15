import { mount, ReactWrapper } from "enzyme";
import React from "react";
import AddGraph from "../../../src/components/add-graph/AddGraph";
import { StoreType } from "../../../src/domain/store-type";
import { CreateSimpleGraphRepo } from "../../../src/rest/repositories/create-simple-graph-repo";

jest.mock("../../../src/rest/repositories/create-simple-graph-repo");
let wrapper: ReactWrapper;

beforeEach(() => (wrapper = mount(<AddGraph />)));
afterEach(() => wrapper.unmount());
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
describe("AddGraph UI component", () => {
  describe("Layout", () => {
    it("Should have a Graph Id text field", () => {
      const textfield = wrapper.find("input");
      expect(textfield.at(0).props().name).toBe("graph-id");
    });
    it("Should have a graph description text field", () => {
      const textfield = wrapper.find("textarea#graph-description");
      expect(textfield.props().name).toBe("graph-description");
    });
    it("Should have a store type select with the correct label", () => {
      const select = wrapper.find("div#storetype-select-grid");
      expect(select.text()).toBe("Store TypeMap StoreStore TypeSet to Map Store by default");
    });
    it("should have a Submit button", () => {
      const submitButton = wrapper.find("button#add-new-graph-button").text();
      expect(submitButton).toBe("Add Graph");
    });
    it("Should allow storetype to be selected", () => {
      selectStoreType(StoreType.ACCUMULO);
      const selectText = wrapper.find("div#storetype-select-grid").find("div#storetype-select");
      expect(selectText.text()).toBe("Accumulo");
      selectStoreType(StoreType.MAPSTORE);
      expect(selectText.text()).toBe("Map Store");
    });
    it("Should allow federated store to be selected", () => {
      selectStoreType(StoreType.FEDERATED_STORE);
      const selectText = wrapper.find("div#storetype-select-grid").find("div#storetype-select");
      expect(selectText.text()).toBe("Federated Store");
    });
    it("should have an elements text area", () => {
      const elementsTextfield = wrapper.find("textarea#schema-elements");
      expect(elementsTextfield.props().name).toBe("schema-elements");
    });
    it("should have a types text area", () => {
      const typesTextfield = wrapper.find("textarea#schema-types");
      expect(typesTextfield.props().name).toBe("schema-types");
    });
    it("should have icon button", () => {
      const fileButton = wrapper.find("button").at(0).find("svg");
      expect(fileButton).toHaveLength(1);
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
  describe("Schema validation integration", () => {
    it("should display validation errors as an Alert Notification", async () => {
      inputGraphId("OK Graph");
      inputDescription("description");
      inputElements({ blah: "blahhhhh" });
      inputTypes({ blah: "blahhhhh" });

      await clickSubmit();

      const expectedMessage =
          "Error(s): Elements Schema does not contain property entities, " +
          "Elements Schema does not contain property edges, " +
          '["blah"] are invalid Elements schema root properties, ' +
          "Types Schema does not contain property types, " +
          '["blah"] are invalid Types schema root properties';
      expect(wrapper.find("div#notification-alert").text()).toBe(expectedMessage);
    });
  });
  describe("Add Graph Button", () => {
    it("should be disabled when Graph Name and Graph Description fields are empty", () => {
      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(true);
    });
    it("should be disabled when Graph Name field is empty", () => {
      inputDescription("test");
      inputElements(elements);
      inputTypes(types);
      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(true);
    });
    it("should be disabled when Graph Description field is empty", () => {
      inputGraphId("test");
      inputElements(elements);
      inputTypes(types);
      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(true);
    });
    it("Should be enabled when Graph Name and Graph Description is not empty", () => {
      inputGraphId("test");
      inputDescription("test");
      inputElements(elements);
      inputTypes(types);
      selectStoreType(StoreType.MAPSTORE);
      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(false);
    });
    it("Should be enabled when Graph Name and Graph Description is not empty and Accumulo selected", () => {
      inputGraphId("test");
      inputDescription("test");
      inputElements(elements);
      inputTypes(types);
      selectStoreType(StoreType.ACCUMULO);
      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(false);
    });
    it("Should be disabled when federated selected and no proxy stores added", () => {
      inputGraphId("test");
      inputDescription("test");
      inputElements(elements);
      inputTypes(types);
      selectStoreType(StoreType.FEDERATED_STORE);
      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(true);
    });
    it("should be disabled when the elements field is empty", () => {
      inputGraphId("G");
      inputDescription("test");
      inputElements(elements);

      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(true);
    });
    it("should be disabled when the types field is empty", () => {
      inputGraphId("G");
      inputDescription("test");
      inputTypes(types);

      expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(true);
    });
  });

  describe("Add Proxy Button", () => {
    it("should be disabled when federated is selected but no proxy url entered", () => {
      selectStoreType(StoreType.FEDERATED_STORE);
      wrapper.update();
      wrapper.update();
      wrapper.update();
      wrapper.update();
      wrapper.update();
      expect(wrapper.find("div#storetype-select-grid").html()).toBe("");
      expect(wrapper.find("button#add-new-proxy-button").props().disabled).toBe(true);
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

      expect(wrapper.find("div#notification-alert").text()).toBe("OK Graph was successfully added");
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
  function inputDescription(description: string): void {
    wrapper.find("textarea#graph-description").simulate("change", {
      target: { value: description },
    });
    expect(wrapper.find("textarea#graph-description").props().value).toBe(description);
  }
  function inputElements(elementsObject: object): void {
    wrapper.find("textarea#schema-elements").simulate("change", {
      target: { value: JSON.stringify(elementsObject) },
    });
    expect(wrapper.find("textarea#schema-elements").props().value).toBe(JSON.stringify(elementsObject));
  }

  function inputTypes(typesObject: object): void {
    wrapper.find("textarea#schema-types").simulate("change", {
      target: { value: JSON.stringify(typesObject) },
    });
    expect(wrapper.find("textarea#schema-types").props().value).toBe(JSON.stringify(typesObject));
  }
  
  
  function mockAddGraphRepoWithFunction(f: () => void): void {
    // @ts-ignore
    CreateSimpleGraphRepo.mockImplementationOnce(() => ({
      create: f,
    }));
  }
});
