import {mount, ReactWrapper} from "enzyme";
import React from "react";
import {act} from "react-dom/test-utils";
import CreateGraph from "../../../src/components/create-graph/create-graph";
import {Graph} from "../../../src/domain/graph";
import {StoreType} from "../../../src/domain/store-type";
import {
    CreateStoreTypesGraphRepo,
    ICreateGraphConfig
} from "../../../src/rest/repositories/create-storetypes-graph-repo";
import {GetAllGraphsRepo} from "../../../src/rest/repositories/get-all-graphs-repo";
import {GetGraphDescriptionRepo} from "../../../src/rest/repositories/get-graph-description-repo";
import {GetGraphIdRepo} from "../../../src/rest/repositories/get-graph-id-repo";
import {GetGraphStatusRepo} from "../../../src/rest/repositories/get-graph-status-repo";
import {RestApiError} from "../../../src/rest/RestApiError";
import {GetStoreTypesRepo} from "../../../src/rest/repositories/get-store-types-repo";
import {IStoreTypesResponse} from "../../../src/rest/http-message-interfaces/response-interfaces";

jest.mock("../../../src/rest/repositories/create-storetypes-graph-repo");
jest.mock("../../../src/rest/repositories/get-all-graphs-repo");
jest.mock("../../../src/rest/repositories/get-graph-status-repo");
jest.mock("../../../src/rest/repositories/get-graph-description-repo");
jest.mock("../../../src/rest/repositories/get-graph-id-repo");
jest.mock("../../../src/rest/repositories/get-store-types-repo");


let wrapper: ReactWrapper;

beforeEach(async() => {
    mockGetAllGraphsRepoToReturn([]);
    wrapper = mount(<CreateGraph/>);
});

afterEach(() => {
    wrapper.unmount();
    jest.resetAllMocks();
});

describe("CreateGraph UI component", () => {
    describe("Layout On Render", () => {
        it("Should have a Graph Id, Description, Store Type dropdown inputs", () => {
            const textfield = wrapper.find("input");
            expect(textfield.at(0).props().name).toBe("Graph ID");

            const descriptionTextArea = wrapper.find("textarea#graph-description-input");
            expect(descriptionTextArea.props().name).toBe("Graph Description");

            const select = wrapper.find("div#storetype-select-grid");
            expect(select.text()).toBe("Store Type​​");
        });
        it("should have icon button", () => {
            const fileButton = wrapper.find("button").at(0).find("svg");
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
    describe("When Federated StoreType Is Selected", () => {
        beforeEach(() => {
             mockGetStoreTypesRepoToReturn({
                storeTypes: [
                    "accumulo",
                    "mapStore",
                    "proxy",
                    "proxyNoContextRoot"
                ],
                federatedStoreTypes: [
                    "federated"
                ]
            });
            waitForComponentToRender(wrapper);
        });
        it("Should have a URL Input, Add Button & Graph Table when federated store is selected", async () => {
            selectStoreType("federated");
            await wrapper.update();
            await wrapper.update();
            const urlInput = wrapper.find("input#proxy-url-input");
            expect(urlInput.props().name).toBe("Proxy Graph Base URL");
            const addButton = wrapper.find("button#add-new-proxy-button");
            expect(addButton.text()).toBe("Add Proxy Graph");
            const graphTable = wrapper.find("table");
            expect(graphTable.text()).toBe("Graph IDDescriptionType No Graphs.");
        });
        it("Should disable the add proxy graph button when the proxy graph URL textfield is empty", () => {

            const button = wrapper.find("button#add-new-proxy-button");
            expect(button.props().disabled).toEqual(true);
        });
        it("Should add a graph to the graphs table when a URL is entered and the Add proxy button is clicked", async() => {
            mockGetGraphStatus("UP");
            mockGetGraphDescription("Description for this Proxy Graph");
            mockGetGraphId("graph-id");

            await inputProxyURL("http://test.graph.url");
            await clickAddProxy();

            const graphTable = wrapper.find("table");
            expect(graphTable.text()).toBe(
                "Graph IDDescriptionType graph-idDescription for this Proxy GraphProxy Graph"
            );
        });
        it("Should not add graph when status is down to the graphs table and display notification", async() => {
            mockGetGraphStatus("DOWN");
            mockGetGraphStatusRepoToThrowError();
            await inputProxyURL("http://test.graph.url");
            await clickAddProxy();

            const graphTable = wrapper.find("table");
            expect(graphTable.text()).not.toContain("http://test.graph.url");
        });
        it("Should select a graph in table", async() => {
            mockGetGraphStatus("UP");
            mockGetGraphDescription("AnotherDesc");
            await inputProxyURL("https://www.testURL.com/");
            await clickAddProxy();
            mockGetGraphStatus("UP");
            mockGetGraphDescription("AnotherDesc");
            await inputProxyURL("https://www.testURL2.com/");
            await clickAddProxy();

            clickTableBodyCheckBox(0, false);

            expect(wrapper.find("table").find("input").at(1).props().checked).toBe(
                false
            );
        });
        it("Should allow all graphs in the table to be selected when the checkbox in the header is checked", async() => {
            mockGetGraphStatus("UP");
            mockGetGraphDescription("AnotherDesc");
            await inputProxyURL("https://www.testURL.com/");
            await clickAddProxy();
            mockGetGraphStatus("UP");
            await inputProxyURL("https://www.testURL2.com/");
            await clickAddProxy();
            await wrapper.update();

            clickTableHeaderCheckBox(true);

            const tableInputs = wrapper.find("table").find("input");
            expect(tableInputs.at(0).props().checked).toBe(true);
            expect(tableInputs.at(1).props().checked).toBe(true);
            expect(tableInputs.at(2).props().checked).toBe(true);
        });
        it("Should disable the submit graph button when no proxy stores are selected", () => {
            inputGraphId("test");
            inputDescription("test");


            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(
                true
            );
        });
        it("Should uncheck all graphs in the table when the uncheck all button is clicked", async() => {
            mockGetGraphStatus("UP");
            mockGetGraphDescription("AnotherDesc");

            await inputProxyURL("https://www.testURL.com/");
            await clickAddProxy();
            mockGetGraphStatus("UP");
            mockGetGraphDescription("AnotherDesc");
            await inputProxyURL("https://www.testURL2.com/");
            await clickAddProxy();

            clickTableHeaderCheckBox(true);
            clickTableHeaderCheckBox(false);

            const tableInputs = wrapper.find("table").find("input");
            expect(tableInputs.at(0).props().checked).toBe(false);
            expect(tableInputs.at(1).props().checked).toBe(false);
            expect(tableInputs.at(2).props().checked).toBe(false);
        });
        it("Should call CreateGraphRepo with Federated Store Graph request params and display success message", async() => {
            const mock = jest.fn();
            mockCreateGraphRepoWithFunction(mock);
            mockGetGraphDescription("test");
            mockGetGraphId("test-graph");
            mockGetGraphStatus("UP");

            inputGraphId("OK Graph");
            inputDescription("test");


            await inputProxyURL("https://www.testURL.com/");
            await clickAddProxy();
            await wrapper.update();

            await clickSubmit();
            await wrapper.update();

            const expectedConfig: ICreateGraphConfig = {
                proxyStores: [{graphId: "test-graph", url: "https://www.testURL.com/"}]
            };
            expect(wrapper.find("div#notification-alert").text()).toBe(
                "OK Graph was successfully added"
            );
            expect(mock).toHaveBeenLastCalledWith(
                "OK Graph",
                "test",
                StoreType.FEDERATED_STORE,
                expectedConfig,
            );

        });
        it("Should call CreateGraphRepo with Federated Store Graph request params and display success message even if getGraphId and getDescription throws exception", async() => {
            const mock = jest.fn();
            mockCreateGraphRepoWithFunction(mock);
            mockGetGraphIdRepoToThrowError();
            mockGetGraphDescriptionRepoToThrowError();
            mockGetGraphStatus("UP");

            inputGraphId("OK Graph");
            inputDescription("test");


            await inputProxyURL("https://www.testURL.com/");
            await clickAddProxy();
            await wrapper.update();

            await clickSubmit();
            await wrapper.update();

            const expectedConfig: ICreateGraphConfig = {
                proxyStores: [{graphId: "n/a", url: "https://www.testURL.com/"}]
            };
            expect(wrapper.find("div#notification-alert").text()).toBe(
                "OK Graph was successfully added"
            );
            expect(mock).toHaveBeenLastCalledWith(
                "OK Graph",
                "test",
                StoreType.FEDERATED_STORE,
                expectedConfig,
            );

        });
    });
    describe("When Map Store Is Selected", () => {
        it("Should call CreateGraphRepo with Map Store Graph request params and display success message", async() => {
            const mock = jest.fn();
            mockCreateGraphRepoWithFunction(mock);

            inputGraphId("map-store-graph");
            inputDescription("Mappy description");
            selectStoreType(StoreType.MAPSTORE);
            inputElements(elements);
            inputTypes(types);

            await clickSubmit();

            const expectedConfig: ICreateGraphConfig = {
                schema: {elements: elements, types: types},
            };
            expect(mock).toHaveBeenLastCalledWith("map-store-graph", "Mappy description", StoreType.MAPSTORE, expectedConfig);
            expect(wrapper.find("div#notification-alert").text()).toBe(
                "map-store-graph was successfully added"
            );
        });
    });
    describe("When Accumulo Store Is Selected", () => {
        it("Should call CreateGraphRepo with Accumulo Store Graph request params and display success message", async() => {
            const mock = jest.fn();
            mockCreateGraphRepoWithFunction(mock);

            inputGraphId("accumulo-graph");
            inputDescription("None");
            selectStoreType(StoreType.ACCUMULO);
            inputElements(elements);
            inputTypes(types);

            await clickSubmit();

            const expectedConfig: ICreateGraphConfig = {
                schema: {elements: elements, types: types},
            };
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

    describe("Create Graph Button", () => {
        it("should be disabled when Graph Name and Graph Description fields are empty", () => {
            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(
                true
            );
        });
        it("should be disabled when Graph Name field is empty", () => {
            inputDescription("test");
            inputElements(elements);
            inputTypes(types);
            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(
                true
            );
        });
        it("should be disabled when Graph Description field is empty", () => {
            inputGraphId("test");
            inputElements(elements);
            inputTypes(types);
            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(
                true
            );
        });
        it("Should be enabled when Graph Name and Graph Description is not empty", () => {
            inputGraphId("test");
            inputDescription("test");
            inputElements(elements);
            inputTypes(types);
            selectStoreType(StoreType.MAPSTORE);
            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(
                false
            );
        });
        it("Should be enabled when Graph Name and Graph Description is not empty and Accumulo selected", () => {
            inputGraphId("test");
            inputDescription("test");
            inputElements(elements);
            inputTypes(types);
            selectStoreType(StoreType.ACCUMULO);
            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(
                false
            );
        });
        it("Should be disabled when federated selected and no proxy stores added", () => {
            inputGraphId("test");
            inputDescription("test");
            inputElements(elements);
            inputTypes(types);

            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(
                true
            );
        });
        it("should be disabled when the elements field is empty", () => {
            inputGraphId("G");
            inputDescription("test");
            inputElements(elements);

            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(
                true
            );
        });
        it("should be disabled when the types field is empty", () => {
            inputGraphId("G");
            inputDescription("test");
            inputTypes(types);

            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(
                true
            );
        });
        it("should be disabled when MAP STORE selected and elements schema has error", () => {
            inputGraphId("G");
            inputDescription("test");
            selectStoreType(StoreType.MAPSTORE);
            inputElements({invalid: "json"});
            inputTypes(types);

            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(
                true
            );
        });
        it("should be disabled when MAP STORE selected and types schema has error", () => {
            inputGraphId("G");
            inputDescription("test");
            selectStoreType(StoreType.MAPSTORE);
            inputElements(elements);
            inputTypes({invalid: "json"});


            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(
                true
            );
        });
        it("should be disabled when the elements schema has error", () => {
            inputGraphId("G");
            inputDescription("test");
            selectStoreType(StoreType.ACCUMULO);
            inputElements({invalid: "json"});
            inputTypes(types);

            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(
                true
            );
        });
        it("should be disabled when the types schema has error", () => {
            inputGraphId("G");
            inputDescription("test");
            selectStoreType(StoreType.ACCUMULO);
            inputElements(elements);
            inputTypes({invalid: "json"});


            expect(wrapper.find("button#create-new-graph-button").props().disabled).toBe(
                true
            );
        });
    });

    describe("On Submit Request", () => {
        it("should display success message in the NotificationAlert", async() => {
            mockCreateGraphRepoWithFunction(() => {
            });
            inputGraphId("OK Graph");
            inputDescription("test");
            inputElements(elements);
            inputTypes(types);

            await clickSubmit();

            expect(wrapper.find("div#notification-alert").text()).toBe(
                "OK Graph was successfully added"
            );
        });
    });
});

async function clickSubmit(): Promise<void> {
    await act(async() => {
        wrapper.find("button#create-new-graph-button").simulate("click");
    });
    await wrapper.update();
    await wrapper.update();
}

function inputGraphId(graphId: string): void {
    wrapper.find("input#graph-id-input").simulate("change", {
        target: {value: graphId},
    });
}

async function selectStoreType(storeType: string) {
    console.log(wrapper.html())
    await act(async() => {
    wrapper
        .find("div#storetype-formcontrol")
        .find("input")
        .simulate("change", {
            target: {value: storeType},
        });})
}

async function inputProxyURL(url: string): Promise<void> {
    await act(async() => {
        wrapper
            .find("div#proxy-url-grid")
            .find("input")
            .simulate("change", {
                target: {value: url},
            });
    });
}

async function clickAddProxy(): Promise<void> {
    await act(async() => {
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
            target: {checked: check},
        });
}

function clickTableHeaderCheckBox(check: boolean) {
    wrapper
        .find("table")
        .find("thead")
        .find("input")
        .simulate("change", {
            target: {checked: check},
        });
}

function inputDescription(description: string): void {
    wrapper.find("textarea#graph-description-input").simulate("change", {
        target: {value: description},
    });
    expect(wrapper.find("textarea#graph-description-input").props().value).toBe(
        description
    );
}

function inputElements(elementsObject: object): void {
    wrapper.find("textarea#schema-elements-input").simulate("change", {
        target: {value: JSON.stringify(elementsObject)},
    });
    expect(wrapper.find("textarea#schema-elements-input").props().value).toBe(
        JSON.stringify(elementsObject)
    );
}

function inputTypes(typesObject: object): void {
    wrapper.find("textarea#schema-types-input").simulate("change", {
        target: {value: JSON.stringify(typesObject)},
    });
    expect(wrapper.find("textarea#schema-types-input").props().value).toBe(
        JSON.stringify(typesObject)
    );
}

// @ts-ignore
async function waitForComponentToRender(wrapper: ReactWrapper) {
    // React forces test to use act(() => {}) when the component state is updated in some cases
    await act(async() => {
        await new Promise((resolve) => setTimeout(resolve));
        wrapper.update();
        wrapper.update();
    });
}

function mockCreateGraphRepoWithFunction(f: () => void): void {
    // @ts-ignore
    CreateStoreTypesGraphRepo.mockImplementationOnce(() => ({
        create: f,
    }));
}

function mockGetAllGraphsRepoToReturn(graphs: Graph[]): void {
    // @ts-ignore
    GetAllGraphsRepo.mockImplementationOnce(() => ({
        getAll: graphs,
    }));
}

function mockGetStoreTypesRepoToReturn(storetypes: IStoreTypesResponse): void {
    // @ts-ignore
    GetStoreTypesRepo.mockImplementationOnce(() => ({
        get: () =>
            new Promise((resolve, reject) => {
                resolve(storetypes);
            }),

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
}

function mockGetGraphDescription(description: string): void {
    // @ts-ignore
    GetGraphDescriptionRepo.mockImplementationOnce(() => ({
        getDescription: () =>
            new Promise((resolve, reject) => {
                resolve(description);
            }),

    }));
}

function mockGetGraphId(graphId: string): void {
    // @ts-ignore
    GetGraphIdRepo.mockImplementationOnce(() => ({
        getGraphId: () =>
            new Promise((resolve, reject) => {
                resolve(graphId);
            }),

    }));
}

function mockGetGraphStatusRepoToThrowError() {
    // @ts-ignore
    GetGraphStatusRepo.mockImplementationOnce(() => ({
        getStatus: () => {
            throw new RestApiError("Server Error", "Invalid proxy URL");
        },
    }));
}

function mockGetGraphDescriptionRepoToThrowError() {
    // @ts-ignore
    GetGraphDescriptionRepo.mockImplementationOnce(() => ({
        getDescription: () => {
            throw new RestApiError("Server Error", "Invalid proxy URL");
        }
    }));
}

function mockGetGraphIdRepoToThrowError() {
    // @ts-ignore
    GetGraphIdRepo.mockImplementationOnce(() => ({
        getGraphId: () => {
            throw new RestApiError("Server Error", "Invalid proxy URL");
        },
    }));
}

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
