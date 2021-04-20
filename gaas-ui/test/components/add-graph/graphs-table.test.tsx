import {mount, ReactWrapper} from "enzyme";
import React from "react";
import GraphsTable from "../../../src/components/add-graph/graphs-table";
import {Graph} from "../../../src/domain/graph";
import {GraphType} from "../../../src/domain/graph-type";

let component: ReactWrapper
const graphs = [new Graph("test-graph","test description", "","", GraphType.GAAS_GRAPH),new Graph("test-graph2","test description", "","", GraphType.GAAS_GRAPH)]
const selectedGraphs =["test-graph"]
const onClickCheckboxMockCallback = jest.fn();
beforeEach(() => {
     component = mount(
        <GraphsTable hide={false} graphs={graphs} selectedGraphs={selectedGraphs} onClickCheckbox={onClickCheckboxMockCallback}/>
    )
})

afterEach(() => {
    component.unmount()
})


describe("GraphsTable UI Component", () => {
    it("Should have the correct graphs in the table when graphs is passed in as a value", () => {
        expect(component.find("table").text()).toBe("Graph IDDescriptionType test-graphtest descriptionGaaS Graphtest-graph2test descriptionGaaS Graph")
    })
    it("Should allow graphs in the table to be selected using a checkbox", () => {
        const tableBodyCheckboxes = component.find("table").find("tbody").find("input");
        expect(tableBodyCheckboxes.at(0).props().checked).toBe(true);
        expect(tableBodyCheckboxes.at(1).props().checked).toBe(false);
    })
    it("Should allow a graph checkbox to be unselected", () => {
        clickCheckbox(1,false);
        expect(onClickCheckboxMockCallback).toHaveBeenCalledWith([]);
    })
    it("Should allow a graph checkbox to be selected", () => {
        clickCheckbox(2,true )
        expect(onClickCheckboxMockCallback).toHaveBeenCalledWith([ "test-graph","test-graph2"]);
    })
})
describe("Hide graphs table if federated store is not selected", () => {
    const component = mount(
        <GraphsTable hide={true} graphs={[]} selectedGraphs={[]} onClickCheckbox={onClickCheckboxMockCallback}/>
    )
    it("Should not be visible when hide is true", () => {
        expect(component.find("div#graphs-table").length).toBe(0);
    })
})
function clickCheckbox(row: number, checked: boolean) {
    component.find("table").find("input").at(row).simulate("change", {
        target: { checked: checked },
    })
}