/*
 * Copyright 2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */

import { mount, ReactWrapper } from "enzyme";
import React from "react";
import ProxyGraphsTable from "../../../src/components/create-graph/proxy-graphs-table";
import { Graph } from "../../../src/domain/graph";
import { GraphType } from "../../../src/domain/graph-type";

let component: ReactWrapper;
const graphs = [
    new Graph("test-graph", "A description", "", "", "UP", "mapStore", GraphType.GAAS_GRAPH),
    new Graph("test-graph2", "Another description", "", "", "UP", "federated", GraphType.GAAS_GRAPH),
    new Graph("another-graph3", "Some description", "", "", "DOWN", "accumulo", GraphType.GAAS_GRAPH),
];
const selectedGraphs = ["test-graph"];
const onClickCheckboxMockCallback = jest.fn();

beforeEach(() => {
    component = mount(
        <ProxyGraphsTable
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
            "Graph IDDescriptionType test-graphA descriptionGaaS Graphtest-graph2Another descriptionGaaS Graph";
        expect(component.find("table").text()).toBe(expected);
    });
    it("Should allow graphs in the table to be selected using a checkbox", () => {
        const tableBodyCheckboxes = component.find("table").find("tbody").find("input");
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

describe("Hide graphs", () => {
    const component = mount(
        <ProxyGraphsTable hide={true} graphs={[]} selectedGraphs={[]} onClickCheckbox={onClickCheckboxMockCallback} />
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
