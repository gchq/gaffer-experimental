/*
 * Copyright 2021-2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { mount, ReactWrapper, shallow, ShallowWrapper } from "enzyme";
import React from "react";
import { act } from "react-dom/test-utils";
import CreateGraph from "../../../src/components/create-graph/create-graph";
import { Graph } from "../../../src/domain/graph";
import {
    CreateStoreTypesGraphRepo,
    ICreateGraphConfig,
} from "../../../src/rest/repositories/create-storetypes-graph-repo";
import { GetAllGraphsRepo } from "../../../src/rest/repositories/get-all-graphs-repo";
import { GetGraphDescriptionRepo } from "../../../src/rest/repositories/get-graph-description-repo";
import { GetGraphIdRepo } from "../../../src/rest/repositories/get-graph-id-repo";
import { GetGraphStatusRepo } from "../../../src/rest/repositories/get-graph-status-repo";
import { APIError } from "../../../src/rest/APIError";
import { GetStoreTypesRepo, IStoreTypes } from "../../../src/rest/repositories/get-store-types-repo";
import { CreateFederatedGraphRepo } from "../../../src/rest/repositories/create-federated-graph-repo";
import { GraphType } from "../../../src/domain/graph-type";

jest.mock("../../../src/rest/repositories/create-storetypes-graph-repo");
jest.mock("../../../src/rest/repositories/create-federated-graph-repo");
jest.mock("../../../src/rest/repositories/get-all-graphs-repo");
jest.mock("../../../src/rest/repositories/get-graph-status-repo");
jest.mock("../../../src/rest/repositories/get-graph-description-repo");
jest.mock("../../../src/rest/repositories/get-graph-id-repo");
jest.mock("../../../src/rest/repositories/get-store-types-repo");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLocation: () => ({}),
}));

let wrapper: ReactWrapper;

beforeEach(async () => {
    await act(async () => {
        mockGetAllGraphsRepoToReturn([]);
        mockGetStoreTypesRepoToReturn({
            storeTypes: ["accumulo", "mapStore", "proxy", "proxyNoContextRoot"],
            federatedStoreTypes: ["federated"],
        });
        wrapper = mount(<CreateGraph />);
    });
});

afterEach(() => {
    wrapper.unmount();
    jest.resetAllMocks();
});

describe("CreateGraph UI component", () => {
    describe("Layout On Render", () => {
        it("Should have a Graph Id, Description, Store Type dropdown inputs, Graph Lifetime In Days dropdown inputs", () => {
            const textfield = wrapper.find("input");
            expect(textfield.at(0).props().name).toBe("Graph ID");

            const descriptionTextArea = wrapper.find("textarea#graph-description-input");
            expect(descriptionTextArea.props().name).toBe("Graph Description");

            const select = wrapper.find("div#storetype-select-grid");
            expect(select.text()).toBe("Store Type​​");

            const selectGraphLifeTime = wrapper.find("div#graphlifetimeindays-select-grid");
            expect(selectGraphLifeTime.text()).toBe("Graph Lifetime In Days​​");
        });
        it("should have icon button", () => {
            const fileButton = wrapper.find("button").at(1).find("svg");
            expect(fileButton).toHaveLength(1);
        });
        it("should have an elements text area", () => {
            const elementsTextfield = wrapper.find("textarea#schema-elements-input");
            expect(elementsTextfield.props().name).toBe("Schema Elements");
        });
        it("should have a types text area", () => {
            const typesTextfield = wrapper.find("textarea#schema-types-input");
            expect(typesTextfield.props().name).toBe("Schema Types");
        });
        it("should have a Submit button", () => {
            const submitButton = wrapper.find("button#create-new-graph-button").text();
            expect(submitButton).toBe("Create Graph");
        });
    });
    describe("When GetAllGraphsRepo is called", () => {
        let component: ReactWrapper;
        afterEach(() => component.unmount());
        it("Should display an error notification when GetAllGraphsRepo throws an exception", async () => {
            await mockGetAllGraphsRepoToThrow(() => {
                throw new APIError("Server Error", "Timeout exception");
            });
            mockGetStoreTypesRepoToReturn({ storeTypes: [], federatedStoreTypes: [] });
            await act(async () => {
                component = mount(<CreateGraph />);
            });
            component.update();
            component.update();
            component.update();

            expect(component.find("div#notification-alert").text()).toBe(
                "Failed to get all graphs. Server Error: Timeout exception"
            );
        });
        it("Should display the graphs returned by GetAllGraphsRepo in the graphs table, when federated store type is selected", async () => {
            mockGetAllGraphsRepoToReturn([
                new Graph(
                    "apples",
                    "ACTIVE",
                    "http://resoucename-namespace.host-name/ui",
                    "http://resoucename-namespace.host-name/rest",
                    "UP",
                    "mapStore",
                    "2022-06-09t15:55:34.006",
                    GraphType.GAAS_GRAPH,
                    "{}",
                    "{}"
                ),
            ]);
            mockGetStoreTypesRepoToReturn({
                storeTypes: ["accumulo", "mapStore", "proxy", "proxyNoContextRoot"],
                federatedStoreTypes: ["federated"],
            });
            await act(async () => {
                component = mount(<CreateGraph />);
            });

            await selectStoreType(component, "federated");
            await component.update();
            await component.update();
            await component.update();

            const graphTable = component.find("table");
            expect(graphTable.find("tbody").text()).toBe("applesACTIVEGaaS Graph");
        });
    });
    describe("when GetStoreTypesRepo called", () => {
        let component: ReactWrapper;
        afterEach(() => component.unmount());
        it("should show error notification when GetStoreTypesRepo throws an exception", async () => {
            await mockGetStoreTypesRepoToThrow(() => {
                throw new APIError("Server Error", "Timeout exception");
            });
            mockGetAllGraphsRepoToReturn([]);
            await act(async () => {
                component = mount(<CreateGraph />);
            });
            component.update();
            component.update();
            component.update();

            expect(component.find("div#notification-alert").text()).toBe(
                "Storetypes unavailable: Server Error: Timeout exception"
            );
        });
        it("should show helper text when GetStoreTypesRepo returns an empty array", async () => {
            mockGetAllGraphsRepoToReturn([]);
            mockGetStoreTypesRepoToReturn({ storeTypes: [], federatedStoreTypes: [] });
            await act(async () => {
                component = mount(<CreateGraph />);
            });
            component.update();
            component.update();
            component.update();

            expect(component.find("p#storetype-form-helper").text()).toBe("No storetypes available");
        });
    });
    describe("When Federated StoreType Is Selected", () => {
        it("Should have a URL Input, Add Button & Graph Table when federated store is selected", async () => {
            await selectStoreType(wrapper, "federated");
            await wrapper.update();
            await wrapper.update();

            const urlInput = wrapper.find("input#proxy-url-input");
            expect(urlInput.props().name).toBe("Proxy Graph Rest URL");
            const addButton = wrapper.find("button#add-new-proxy-button");
            expect(addButton.text()).toBe("Add Proxy Graph");
            const graphTable = wrapper.find("table");
            expect(graphTable.text()).toBe("Graph IDDescriptionType No Graphs.");
        });
        it("Should disable the add proxy graph button when the proxy graph URL textfield is empty", async () => {
            await selectStoreType(wrapper, "federated");
            await wrapper.update();
            const button = wrapper.find("button#add-new-proxy-button");
            expect(button.props().disabled).toEqual(true);
        });
        it("Should add a graph to the graphs table when a URL is entered and the Add proxy button is clicked", async () => {
            await selectStoreType(wrapper, "federated");
            await wrapper.update();
            mockGetGraphStatus("UP");
            mockGetGraphDescription("Description for this Proxy Graph");
            mockGetGraphId("graph-id");

            await inputProxyURL("http://resoucename-namespace.host-name/rest");
            await clickAddProxy();

            const graphTable = wrapper.find("table");
            expect(graphTable.text()).toBe(
                "Graph IDDescriptionType graph-idDescription for this Proxy GraphProxy Graph"
            );
        });
        it("Should not add graph when status is down to the graphs table and display notification", async () => {
            await selectStoreType(wrapper, "federated");
            await wrapper.update();
            mockGetGraphStatus("DOWN");
            mockGetGraphStatusRepoToThrowError();
            await inputProxyURL("http://resoucename-namespace.host-name/rest");

            await clickAddProxy();

            const graphTable = wrapper.find("table");
            expect(graphTable.text()).not.toContain("http://resoucename-namespace.host-name/rest");
        });
        it("Should select a graph in table", async () => {
            await selectStoreType(wrapper, "federated");
            await wrapper.update();
            mockGetGraphStatus("UP");
            mockGetGraphDescription("AnotherDesc");
            await inputProxyURL("http://resoucename1-namespace.host-name/rest");
            await clickAddProxy();
            mockGetGraphStatus("UP");
            mockGetGraphDescription("AnotherDesc");
            await inputProxyURL("http://resoucename2-namespace.host-name/rest");
            await clickAddProxy();

            clickTableBodyCheckBox(0, false);

            expect(wrapper.find("table").find("input").at(1).props().checked).toBe(false);
        });
        it("Should allow all graphs in the table to be selected when the checkbox in the header is checked", async () => {
            await selectStoreType(wrapper, "federated");
            await wrapper.update();
            mockGetGraphStatus("UP");
            mockGetGraphDescription("AnotherDesc");
            await inputProxyURL("http://resoucename-namespace.host-name/rest");
            await clickAddProxy();
            mockGetGraphStatus("UP");
            await inputProxyURL("http://resoucename2-namespace.host-name/rest");
            await clickAddProxy();
            await wrapper.update();

            clickTableHeaderCheckBox(true);

            const tableInputs = wrapper.find("table").find("input");
            expect(tableInputs.at(0).props().checked).toBe(true);
            expect(tableInputs.at(1).props().checked).toBe(true);
            expect(tableInputs.at(2).props().checked).toBe(true);
        });
        it("Should disable the submit graph button when no proxy stores are selected", async () => {
            await selectStoreType(wrapper, "federated");
            await wrapper.update();
            inputGraphId("test");
            inputDescription("test");

            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(true);
        });
        it("Should uncheck all graphs in the table when the uncheck all button is clicked", async () => {
            await selectStoreType(wrapper, "federated");
            await wrapper.update();
            mockGetGraphStatus("UP");
            mockGetGraphDescription("AnotherDesc");

            await inputProxyURL("http://resoucename-namespace.host-name/rest");
            await clickAddProxy();
            await wrapper.update();
            mockGetGraphStatus("UP");
            mockGetGraphDescription("AnotherDesc");
            await inputProxyURL("http://resoucename2-namespace.host-name/rest");
            await clickAddProxy();
            await wrapper.update();
            clickTableHeaderCheckBox(true);
            clickTableHeaderCheckBox(false);

            const tableInputs = wrapper.find("table").find("input");
            expect(tableInputs.at(0).props().checked).toBe(false);
            expect(tableInputs.at(1).props().checked).toBe(false);
            expect(tableInputs.at(2).props().checked).toBe(false);
        });
        it("Should call CreateGraphRepo with Federated Store Graph request params and display success message", async () => {
            const mock = jest.fn();
            mockCreateFederatedGraphRepoWithFunction(mock);
            await inputGraphId("okgraph");
            await inputDescription("test");
            mockGetGraphDescriptionRepoToThrowError();
            mockGetGraphStatus("UP");
            await selectStoreType(wrapper, "federated");
            await wrapper.update();
            selectGraphLifeTime(wrapper, "10");
            await wrapper.update();

            await mockGetGraphStatus("UP");
            await mockGetGraphId("graphid");
            await mockGetGraphDescription("description");

            await inputProxyURL("http://resoucename-namespace.host-name/rest");
            await clickAddProxy();
            await wrapper.update();
            await clickSubmit();
            const expectedConfig: ICreateGraphConfig = {
                proxySubGraphs: [{ graphId: "graphid", host: "resoucename-namespace.host-name", root: "/rest" }],
            };
            expect(wrapper.find("div#notification-alert").text()).toBe("okgraph was successfully added");
            expect(mock).toHaveBeenLastCalledWith("okgraph", "test", "federated", "10", expectedConfig);
        });
        it("Should call CreateGraphRepo with Federated Store Graph request params and display success message even if getGraphId and getDescription throws exception", async () => {
            const mock = jest.fn();
            mockCreateFederatedGraphRepoWithFunction(mock);
            await inputGraphId("okgraph");
            await inputDescription("test");
            mockGetGraphDescriptionRepoToThrowError();
            mockGetGraphStatus("UP");
            await selectStoreType(wrapper, "federated");
            await wrapper.update();
            selectGraphLifeTime(wrapper, "10");
            await wrapper.update();

            await mockGetGraphStatus("UP");
            await mockGetGraphIdRepoToThrowError();
            await mockGetGraphDescriptionRepoToThrowError();

            await inputProxyURL("http://resoucename-namespace.host-name/rest");
            await clickAddProxy();
            await wrapper.update();
            await clickSubmit();

            const expectedConfig: ICreateGraphConfig = {
                proxySubGraphs: [{ graphId: "n/a", host: "resoucename-namespace.host-name", root: "/rest" }],
            };
            expect(wrapper.find("div#notification-alert").text()).toBe("okgraph was successfully added");
            expect(mock).toHaveBeenLastCalledWith("okgraph", "test", "federated", "10", expectedConfig);
        });
    });
    describe("When Map Store Is Selected", () => {
        it("Should call CreateGraphRepo with Map Store Graph request params and display success message", async () => {
            const mock = jest.fn();
            mockCreateStoreTypesGraphRepoWithFunction(mock);

            inputGraphId("mapstoregraph");
            inputDescription("Mappy description");
            await selectStoreType(wrapper, "mapStore");
            await wrapper.update();
            selectGraphLifeTime(wrapper, "10");
            await wrapper.update();
            inputElements(elementsString);
            inputTypes(typesAsString);

            await clickSubmit();

            const expectedConfig: ICreateGraphConfig = {
                schema: { entities: entities, edges: edges, types: typesAsObject },
            };
            expect(mock).toHaveBeenLastCalledWith(
                "mapstoregraph",
                "Mappy description",
                "mapStore",
                "10",
                expectedConfig
            );
            expect(wrapper.find("div#notification-alert").text()).toBe("mapstoregraph was successfully added");
        });
    });
    describe("When Accumulo Store Is Selected", () => {
        it("Should call CreateGraphRepo with Accumulo Store Graph request params and display success message", async () => {
            const mock = jest.fn();
            mockCreateStoreTypesGraphRepoWithFunction(mock);

            inputGraphId("accumulograph");
            inputDescription("None");
            selectStoreType(wrapper, "accumulo");
            wrapper.update();
            selectGraphLifeTime(wrapper, "10");
            await wrapper.update();
            inputElements(elementsString);
            inputTypes(typesAsString);

            await clickSubmit();

            const expectedConfig: ICreateGraphConfig = {
                schema: { entities: entities, edges: edges, types: typesAsObject },
            };
            expect(mock).toHaveBeenLastCalledWith("accumulograph", "None", "accumulo", "10", expectedConfig);
            expect(wrapper.find("div#notification-alert").text()).toBe("accumulograph was successfully added");
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

    describe("Create Graph Button", () => {
        it("should be disabled when Graph Name and Graph Description fields are empty", () => {
            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(true);
        });
        it("should be disabled when Graph Name field is empty", () => {
            inputDescription("test");
            inputElements(elementsString);
            inputTypes(typesAsString);

            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(true);
        });
        it("should be disabled when Graph Description field is empty", () => {
            inputGraphId("test");
            inputElements(elementsString);
            inputTypes(typesAsString);

            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(true);
        });
        it("Should be enabled when Graph Name and Graph Description is not empty", () => {
            inputGraphId("test");
            inputDescription("test");
            inputElements(elementsString);
            inputTypes(typesAsString);

            selectStoreType(wrapper, "mapStore");
            wrapper.update();
            selectGraphLifeTime(wrapper, "10");
            wrapper.update();
            wrapper.update();
            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(false);
        });
        it("Should be enabled when Graph Name and Graph Description is not empty and Accumulo selected", () => {
            inputGraphId("test");
            inputDescription("test");
            inputElements(elementsString);
            inputTypes(typesAsString);

            selectStoreType(wrapper, "accumulo");
            wrapper.update();
            selectGraphLifeTime(wrapper, "10");
            wrapper.update();
            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(false);
        });
        it("Should be disabled when federated selected and no proxy stores added", async () => {
            await selectStoreType(wrapper, "federated");
            await wrapper.update();
            inputGraphId("test");
            inputDescription("test");

            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(true);
        });
        it("should be disabled when the elements field is empty", () => {
            inputGraphId("G");
            inputDescription("test");
            inputElements(elementsString);

            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(true);
        });
        it("should be disabled when the types field is empty", () => {
            inputGraphId("G");
            inputDescription("test");
            inputTypes(typesAsString);

            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(true);
        });
        it("should be disabled when MAP STORE selected and elements schema has error", () => {
            inputGraphId("G");
            inputDescription("test");
            selectStoreType(wrapper, "mapStore");

            inputElements("invalid :json");
            inputTypes(typesAsString);

            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(true);
        });
        it("should be disabled when MAP STORE selected and types schema has error", () => {
            inputGraphId("G");
            inputDescription("test");
            selectStoreType(wrapper, "mapStore");

            inputElements(elementsString);
            inputTypes("invalid:json");

            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(true);
        });
        it("should be disabled when the elements schema has error", () => {
            inputGraphId("G");
            inputDescription("test");
            selectStoreType(wrapper, "accumulo");
            selectGraphLifeTime(wrapper, "10");
            inputElements("invalid: json");
            inputTypes(typesAsString);

            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(true);
        });
        it("should be disabled when the types schema has error", () => {
            inputGraphId("G");
            inputDescription("test");
            selectStoreType(wrapper, "accumulo");
            inputElements(elementsString);
            inputTypes("invalid:json");

            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(true);
        });
    });

    describe("On Submit Request", () => {
        it("should display success message in the NotificationAlert", async () => {
            mockCreateStoreTypesGraphRepoWithFunction(() => {});
            await inputGraphId("okgraph");
            await inputDescription("test");
            await selectStoreType(wrapper, "mapStore");
            await selectGraphLifeTime(wrapper, "10");
            inputElements(elementsString);
            wrapper.update();
            inputTypes(typesAsString);
            wrapper.update();
            await clickSubmit();
            expect(wrapper.find("div#notification-alert").text()).toBe("okgraph was successfully added");
        });
    });
});

async function clickSubmit(): Promise<void> {
    expect(wrapper.find("button#create-new-graph-button").props().disabled).toEqual(false);
    await act(async () => {
        wrapper.find("button#create-new-graph-button").simulate("click");
    });
    await wrapper.update();
    await wrapper.update();
}

function inputGraphId(graphId: string): void {
    wrapper.find("input#graph-id-input").simulate("change", {
        target: { value: graphId },
    });
}

async function selectStoreType(component: ReactWrapper, storeType: string) {
    await act(async () => {
        component
            .find("div#storetype-formcontrol")
            .find("input")
            .simulate("change", {
                target: { value: storeType },
            });
    });
}

async function selectGraphLifeTime(component: ReactWrapper, graphLifetimeInDays: string) {
    await act(async () => {
        component
            .find("div#graph-lifetime-in-days-formcontrol")
            .find("input")
            .simulate("change", {
                target: { value: graphLifetimeInDays },
            });
    });
}

async function inputProxyURL(url: string): Promise<void> {
    await act(async () => {
        wrapper
            .find("div#proxy-url-grid")
            .find("input")
            .simulate("change", {
                target: { value: url },
            });
    });
}

async function clickAddProxy(): Promise<void> {
    await act(async () => {
        wrapper.find("button#add-new-proxy-button").simulate("click");
    });
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
    wrapper.find("textarea#graph-description-input").simulate("change", {
        target: { value: description },
    });
    expect(wrapper.find("textarea#graph-description-input").props().value).toBe(description);
}

async function inputElements(elementsString: string): Promise<void> {
    await act(async () => {
        wrapper.find("textarea#schema-elements-input").simulate("change", {
            target: { value: elementsString },
        });
    });
    expect(wrapper.find("textarea#schema-elements-input").props().value).toBe(elementsString);
}

async function inputTypes(typesString: string): Promise<void> {
    await act(async () => {
        wrapper.find("textarea#schema-types-input").simulate("change", {
            target: { value: typesString },
        });
    });
    expect(wrapper.find("textarea#schema-types-input").props().value).toBe(typesString);
}

function mockCreateStoreTypesGraphRepoWithFunction(f: () => void): void {
    // @ts-ignore
    CreateStoreTypesGraphRepo.mockImplementationOnce(() => ({
        create: f,
    }));
}

function mockCreateFederatedGraphRepoWithFunction(f: () => void): void {
    // @ts-ignore
    CreateFederatedGraphRepo.mockImplementationOnce(() => ({
        create: f,
    }));
}

function mockGetAllGraphsRepoToReturn(graphs: Graph[]): void {
    // @ts-ignore
    GetAllGraphsRepo.mockImplementation(() => ({
        getAll: () =>
            new Promise((resolve) => {
                resolve(graphs);
            }),
    }));
}

function mockGetAllGraphsRepoToThrow(f: () => void): void {
    // @ts-ignore
    GetAllGraphsRepo.mockImplementationOnce(() => ({
        getAll: f,
    }));
}

function mockGetStoreTypesRepoToReturn(storetypes: IStoreTypes): void {
    // @ts-ignore
    GetStoreTypesRepo.mockImplementation(() => ({
        get: () =>
            new Promise((resolve) => {
                resolve(storetypes);
            }),
    }));
}

function mockGetGraphStatus(status: string): void {
    // @ts-ignore
    GetGraphStatusRepo.mockImplementationOnce(() => ({
        getStatus: () =>
            new Promise((resolve) => {
                resolve(status);
            }),
    }));
}

function mockGetGraphDescription(description: string): void {
    // @ts-ignore
    GetGraphDescriptionRepo.mockImplementationOnce(() => ({
        getDescription: () =>
            new Promise((resolve) => {
                resolve(description);
            }),
    }));
}

function mockGetGraphId(graphId: string): void {
    // @ts-ignore
    GetGraphIdRepo.mockImplementationOnce(() => ({
        getGraphId: () =>
            new Promise((resolve) => {
                resolve(graphId);
            }),
    }));
}

function mockGetGraphStatusRepoToThrowError() {
    // @ts-ignore
    GetGraphStatusRepo.mockImplementationOnce(() => ({
        getStatus: () => {
            throw new APIError("Server Error", "Invalid proxy URL");
        },
    }));
}

function mockGetGraphDescriptionRepoToThrowError() {
    // @ts-ignore
    GetGraphDescriptionRepo.mockImplementationOnce(() => ({
        getDescription: () => {
            throw new APIError("Server Error", "Invalid proxy URL");
        },
    }));
}

function mockGetGraphIdRepoToThrowError() {
    // @ts-ignore
    GetGraphIdRepo.mockImplementationOnce(() => ({
        getGraphId: () => {
            throw new APIError("Server Error", "Invalid proxy URL");
        },
    }));
}

async function mockGetStoreTypesRepoToThrow(f: () => void) {
    // @ts-ignore
    GetStoreTypesRepo.mockImplementationOnce(() => ({
        get: f,
    }));
}
const elementsString =
    '{"edges": {"RoadUse": {"description": "A directed edge representing vehicles moving from junction A to junction B.","source": "junction", "destination": "junction","directed": "true","properties": {"startDate": "date.earliest", "endDate": "date.latest","count": "count.long"},"groupBy": ["startDate","endDate"]},"RoadHasJunction": {"description": "A directed edge from each road to all the junctions on that road.","source": "road","destination": "junction","directed": "true"}},"entities": { "Cardinality": {"description": "An entity that is added to every vertex representing the connectivity of the vertex.","vertex": "anyVertex","properties": {"edgeGroup": "set","hllp": "hllp","count": "count.long"},"groupBy": ["edgeGroup"]}}}';
const entities = {
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
};
const edges = {
    RoadUse: {
        description: "A directed edge representing vehicles moving from junction A to junction B.",
        source: "junction",
        destination: "junction",
        directed: "true",
        properties: {
            startDate: "date.earliest",
            endDate: "date.latest",
            count: "count.long",
        },
        groupBy: ["startDate", "endDate"],
    },
    RoadHasJunction: {
        description: "A directed edge from each road to all the junctions on that road.",
        source: "road",
        destination: "junction",
        directed: "true",
    },
};

const typesAsString =
    '{"junction": {"description": "A road junction represented by a String.","class": "java.lang.String"},"road": {"description": "A road represented by a String.", "class": "java.lang.String"}}';
const typesAsObject = {
    junction: {
        description: "A road junction represented by a String.",
        class: "java.lang.String",
    },
    road: {
        description: "A road represented by a String.",
        class: "java.lang.String",
    },
};
