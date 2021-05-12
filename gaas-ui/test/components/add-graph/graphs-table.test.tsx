import { mount, ReactWrapper } from "enzyme";
import React from "react";
import GraphsTable from "../../../src/components/add-graph/graphs-table";
import { Graph } from "../../../src/domain/graph";
import { GraphType } from "../../../src/domain/graph-type";

let component: ReactWrapper;
const graphs = [
  new Graph("test-graph", "A description", "", "", GraphType.GAAS_GRAPH),
  new Graph("test-graph2", "Another description", "", "", GraphType.GAAS_GRAPH),
  new Graph("another-graph3", "Some description", "", "", GraphType.GAAS_GRAPH),
];
const selectedGraphs = ["test-graph"];
const onClickCheckboxMockCallback = jest.fn();

beforeEach(() => {
  component = mount(
    <GraphsTable
      hide={false}
      graphs={graphs}
      selectedGraphs={selectedGraphs}
      onClickCheckbox={onClickCheckboxMockCallback}
    />
  );
});

afterEach(() => {
  component.unmount();
  jest.resetAllMocks();
});

describe("GraphsTable UI Component", () => {
  it("Should have the correct graphs in the table when graphs is passed in as a value", () => {
    const expected =
      "Graph IDDescriptionType test-graphA descriptionGaaS Graphtest-graph2Another descriptionGaaS Graphanother-graph3Some descriptionGaaS Graph";
    expect(component.find("table").text()).toBe(expected);
  });
  it("Should allow graphs in the table to be selected using a checkbox", () => {
    const tableBodyCheckboxes = component
      .find("table")
      .find("tbody")
      .find("input");
    expect(tableBodyCheckboxes.at(0).props().checked).toBe(true);
    expect(tableBodyCheckboxes.at(1).props().checked).toBe(false);
  });
  it("Should remove graph from selected list when checkbox is unchecked as unselected", () => {
    clickBodyCheckbox(0, false);

    expect(onClickCheckboxMockCallback).toHaveBeenCalledWith([]);
  });
  it("Should add graph to selected list when checkbox is checked as selected", () => {
    clickBodyCheckbox(1, true);

    const expected = ["test-graph", "test-graph2"];
    expect(onClickCheckboxMockCallback).toHaveBeenCalledWith(expected);
  });
  it("Should add all graphs to selected list, when header checkbox is clicked", () => {
    clickHeaderCheckbox(true);

    const expected = ["test-graph", "test-graph2", "another-graph3"];
    expect(onClickCheckboxMockCallback).toHaveBeenCalledWith(expected);
  });
  it("Should remove all graphs from selected list, when header checkbox is clicked", () => {
    clickHeaderCheckbox(false);

    expect(onClickCheckboxMockCallback).toHaveBeenCalledWith([]);
  });
});

describe("Hide graphs table if federated store is not selected", () => {
  const component = mount(
    <GraphsTable
      hide={true}
      graphs={[]}
      selectedGraphs={[]}
      onClickCheckbox={onClickCheckboxMockCallback}
    />
  );

  it("Should not be visible when hide is true", () => {
    expect(component.find("div#graphs-table").length).toBe(0);
  });
});

function clickHeaderCheckbox(checked: boolean) {
  component
    .find("table")
    .find("thead")
    .find("input")
    .simulate("change", {
      target: { checked: checked },
    });
}

function clickBodyCheckbox(row: number, checked: boolean) {
  component
    .find("table")
    .find("tbody")
    .find("input")
    .at(row)
    .simulate("change", {
      target: { checked: checked },
    });
}
