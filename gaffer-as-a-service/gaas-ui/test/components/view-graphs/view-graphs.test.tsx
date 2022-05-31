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

import React from "react";
import { mount, ReactWrapper } from "enzyme";
import ViewGraph from "../../../src/components/view-graphs/view-graphs";
import { GetAllGraphsRepo } from "../../../src/rest/repositories/get-all-graphs-repo";
import { Graph } from "../../../src/domain/graph";
import { DeleteGraphRepo } from "../../../src/rest/repositories/delete-graph-repo";
import { APIError } from "../../../src/rest/APIError";
import { GraphType } from "../../../src/domain/graph-type";
import { GetStoreTypesRepo, IStoreTypes } from "../../../src/rest/repositories/get-store-types-repo";
import { GetAllGraphIdsRepo } from "../../../src/rest/repositories/gaffer/get-all-graph-ids-repo";
import { act } from "@testing-library/react";

jest.mock("../../../src/rest/repositories/get-all-graphs-repo");
jest.mock("../../../src/rest/repositories/delete-graph-repo");
jest.mock("../../../src/rest/repositories/get-store-types-repo");
jest.mock("../../../src/rest/repositories/gaffer/get-all-graph-ids-repo");

afterEach(() => jest.resetAllMocks());

describe("When ViewGraphs mounts", () => {
    it("should display Table Headers and Graphs when GetGraphs successful", async () => {
        mockGetGraphsToReturn([
            new Graph(
                "testId1",
                "deployed",
                "http://testId-1.app/ui",
                "http://testId-1.app/rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ]);

        const component = mount(<ViewGraph />);
        await component.update();
        await component.update();

        expect(component.find("thead").text()).toBe(
            "Graph IDStore TypeStatusUI URLREST URLGraph Auto Destroy DateActions"
        );
        expect(component.find("tbody").text()).toBe(
            "testId1 MUPhttp://testId-1.app/uihttp://testId-1.app/rest2022-06-09t15:55:34.006"
        );
        expect(component.find("caption").length).toBe(0);
    });
    it("should display No Graphs caption when ", async () => {
        mockGetGraphsToReturn([]);

        const component = mount(<ViewGraph />);
        await component.update();

        expect(component.find("caption").text()).toBe("No Graphs.");
    });
    it("should display Error Message in AlertNotification when GetGraphs request fails", () => {
        mockGetAllGraphsThrowsError(() => {
            throw new APIError("Client Error", "404 Not Found");
        });

        const component = mount(<ViewGraph />);

        expect(component.find("div#notification-alert").text()).toBe(
            "Failed to get all graphs. Client Error: 404 Not Found"
        );
    });
    it("should not display Error AlertNotification when GetGraphs request successful", async () => {
        mockGetGraphsToReturn([
            new Graph(
                "roadTraffic",
                "DEPLOYED",
                "http://roadTraffic.graph/ui",
                "http://roadTraffic.graph/rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ]);

        const component = mount(<ViewGraph />);
        await component.update();

        const table = component.find("table");
        expect(table).toHaveLength(1);
        expect(table.find("tbody").text()).toBe(
            "roadTraffic MUPhttp://roadTraffic.graph/uihttp://roadTraffic.graph/rest2022-06-09t15:55:34.006"
        );
        expect(component.find("div#notification-alert").length).toBe(0);
    });
    it("should display a down status in the status column when the graph status is down", async () => {
        mockGetGraphsToReturn([
            new Graph(
                "roadTraffic",
                "DEPLOYED",
                "http://roadTraffic.graph/ui",
                "http://roadTraffic.graph/rest",
                "DOWN",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ]);

        const component = mount(<ViewGraph />);
        await component.update();

        const table = component.find("table");
        expect(table.find("tbody").text()).toBe(
            "roadTraffic MDOWNhttp://roadTraffic.graph/uihttp://roadTraffic.graph/rest2022-06-09t15:55:34.006"
        );
    });
});

describe("Refresh Button", () => {
    it("should call GetGraphs again when refresh button clicked", async () => {
        mockGetGraphsToReturn([
            new Graph(
                "roadTraffic",
                "DEPLOYING",
                "http://roadtraffic.graph/ui",
                "http://roadtraffic.graph/rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ]);

        const component = mount(<ViewGraph />);
        await component.update();
        expect(component.find("tbody").text()).toBe(
            "roadTraffic MUPhttp://roadtraffic.graph/uihttp://roadtraffic.graph/rest2022-06-09t15:55:34.006"
        );

        mockGetGraphsToReturn([
            new Graph(
                "roadTraffic",
                "FINISHED DEPLOYMENT",
                "http://roadTraffic.app/ui",
                "http://roadTraffic.app/rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ]);
        await clickRefreshButton(component);

        expect(component.find("tbody").text()).toBe(
            "roadTraffic MUPhttp://roadTraffic.app/uihttp://roadTraffic.app/rest2022-06-09t15:55:34.006"
        );
    });
    it("should reset an existing error message when refresh button is clicked", async () => {
        mockGetAllGraphsThrowsError(() => {
            throw new APIError("Server Error", "Timeout exception");
        });

        const component = mount(<ViewGraph />);
        expect(component.find("div#notification-alert").text()).toBe(
            "Failed to get all graphs. Server Error: Timeout exception"
        );

        mockGetGraphsToReturn([
            new Graph(
                "roadTraffic",
                "FINISHED DEPLOYMENT",
                "http://roadTraffic.app/ui",
                "http://roadTraffic.app/rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ]);
        await clickRefreshButton(component);

        expect(component.find("div#notification-alert").length).toBe(0);
    });
});

describe("Delete Button", () => {
    let component: ReactWrapper;
    afterEach(() => {
        component.unmount();
    });
    it("should send a delete request when the delete button has been clicked", async () => {
        DeleteGraphRepo.prototype.delete = jest.fn();
        mockGetGraphsToReturn([
            new Graph(
                "peaches",
                "ACTIVE",
                "http://peaches.graph/ui",
                "http://peaches.graph/rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ]);

        await act(async () => {
            component = mount(<ViewGraph />);
        });
        await component.update();
        await component.update();
        expect(component.find("tbody").text()).toBe(
            "peaches MUPhttp://peaches.graph/uihttp://peaches.graph/rest2022-06-09t15:55:34.006"
        );

        mockGetGraphsToReturn([
            new Graph(
                "peaches",
                "DELETED",
                "http://peaches.graph/ui",
                "http://peaches.graph/rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ]);
        component.find("tbody").find("button#view-graphs-delete-button-0").simulate("click");
        await component.update();
        await component.update();

        expect(DeleteGraphRepo.prototype.delete).toHaveBeenLastCalledWith("peaches");
    });
    it("should send a delete request for correct graphId from many graphs when the delete button has been clicked", async () => {
        DeleteGraphRepo.prototype.delete = jest.fn();
        mockGetGraphsToReturn([
            new Graph(
                "apples",
                "ACTIVE",
                "apples URL",
                "apples URL rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
            new Graph(
                "pears",
                "INACTIVE",
                "pears URL",
                "pears URL rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ]);

        await act(async () => {
            component = mount(<ViewGraph />);
        });
        await component.update();
        await component.update();
        expect(component.find("tbody").text()).toBe(
            "apples MUPapples URLapples URL rest2022-06-09t15:55:34.006pears MUPpears URLpears URL rest2022-06-09t15:55:34.006"
        );

        mockGetGraphsToReturn([
            new Graph(
                "apples",
                "ACTIVE",
                "apples URL",
                "apples URL rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
            new Graph(
                "pears",
                "DELETED",
                "pears URL",
                "pears URL rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ]);
        component.find("tbody").find("button#view-graphs-delete-button-1").simulate("click");
        await component.update();
        await component.update();

        expect(DeleteGraphRepo.prototype.delete).toHaveBeenLastCalledWith("pears");
    });
    it("should change the current status of the graph when the delete button is clicked", async () => {
        DeleteGraphRepo.prototype.delete = jest.fn();
        mockGetGraphsToReturn([
            new Graph(
                "apples",
                "ACTIVE",
                "apples URL",
                "apples URL rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
            new Graph(
                "pears",
                "INACTIVE",
                "pears URL",
                "pears URL rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ]);

        await act(async () => {
            component = mount(<ViewGraph />);
        });
        await component.update();
        await component.update();
        expect(component.find("tbody").text()).toBe(
            "apples MUPapples URLapples URL rest2022-06-09t15:55:34.006pears MUPpears URLpears URL rest2022-06-09t15:55:34.006"
        );

        mockGetGraphsToReturn([
            new Graph(
                "apples",
                "ACTIVE",
                "http://apples.graph/ui",
                "http://apples.graph/rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
            new Graph(
                "pears",
                "DELETION IN PROGRESS",
                "http://pears.graph/ui",
                "http://pears.graph/rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ]);
        component.find("tbody").find("button#view-graphs-delete-button-1").simulate("click");
        await component.update();
        await component.update();
        await component.update();

        expect(component.find("tbody").text()).toBe(
            "apples MUPhttp://apples.graph/uihttp://apples.graph/rest2022-06-09t15:55:34.006pears MUPhttp://pears.graph/uihttp://pears.graph/rest2022-06-09t15:55:34.006"
        );
    });
    it("should notify error and not refresh graphs when delete request returns server error", async () => {
        mockDeleteGraphRepoToThrowError(() => {
            throw new APIError("Server Error", "Timeout exception");
        });
        mockGetGraphsToReturn([
            new Graph(
                "bananas",
                "INACTIVE",
                "bananas URL",
                "bananas URL rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ]);
        mockGetStoreTypesRepoToReturn({
            storeTypes: ["accumulo", "mapStore", "proxy", "proxyNoContextRoot"],
            federatedStoreTypes: ["federated"],
        });
        await act(async () => {
            component = mount(<ViewGraph />);
        });
        await component.update();
        await component.update();
        expect(component.find("tbody").text()).toBe("bananas MUPbananas URLbananas URL rest2022-06-09t15:55:34.006");

        component.find("tbody").find("button#view-graphs-delete-button-0").simulate("click");
        await component.update();

        // Only call GetGraphsRepo on mount and not 2nd time when delete graph is unsuccessful
        expect(GetAllGraphsRepo).toBeCalledTimes(1);
        expect(component.find("div#notification-alert").text()).toBe(
            'Failed to delete graph "bananas". Server Error: Timeout exception'
        );
    });
});
describe("Integration with GetAllGraphIds repo", () => {
    let component: ReactWrapper;
    afterEach(() => {
        component.unmount();
    });
    it("should display federated graph ids as a list of strings", async () => {
        await mockGetStoreTypesRepoToReturn({
            storeTypes: ["accumulo", "mapStore", "proxy", "proxyNoContextRoot"],
            federatedStoreTypes: ["federated"],
        });
        await mockGetGraphsToReturn([
            new Graph(
                "apples",
                "ACTIVE",
                "http://apples.graph/ui",
                "http://apples.graph/rest",
                "UP",
                "federated",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
            new Graph(
                "pears",
                "DELETION IN PROGRESS",
                "http://pears.graph/ui",
                "http://pears.graph/rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ]);
        await act(async () => {
            component = mount(<ViewGraph />);
        });
        await act(async () => {
            await mockGetAllGraphIdsRepoToReturn(["accumulo-graph-1", "accumulo-graph-2"]);
        });

        await component.update();
        await component.update();
        await clickExpandRow(component);
        expect(component.find("tr#federated-graph-ids-0").text()).toBe(
            "Federated Graphs: accumulo-graph-1, accumulo-graph-2"
        );
    });
    it("should not display any graph ids when GetAllGraphIds returns and empty array", async () => {
        await mockGetStoreTypesRepoToReturn({
            storeTypes: ["accumulo", "mapStore", "proxy", "proxyNoContextRoot"],
            federatedStoreTypes: ["federated"],
        });
        await mockGetGraphsToReturn([
            new Graph(
                "apples",
                "ACTIVE",
                "http://apples.graph/ui",
                "http://apples.graph/rest",
                "UP",
                "federated",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
            new Graph(
                "pears",
                "DELETION IN PROGRESS",
                "http://pears.graph/ui",
                "http://pears.graph/rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ]);
        await act(async () => {
            component = mount(<ViewGraph />);
        });
        await act(async () => {
            await mockGetAllGraphIdsRepoToReturn([]);
        });

        await component.update();
        await component.update();
        await clickExpandRow(component);
        expect(component.find("tr#federated-graph-ids-0").text()).toBe("No Federated Graphs");
    });
    it("should display an error if GetAllGraphIds throws an error when called", async () => {
        await act(async () => {
            mockGetAllGraphIdsRepoThrowsError(() => {
                throw new APIError("Server Error", "Timeout exception");
            });
        });
        mockGetStoreTypesRepoToReturn({
            storeTypes: ["accumulo", "mapStore", "proxy", "proxyNoContextRoot"],
            federatedStoreTypes: ["federated"],
        });
        mockGetGraphsToReturn([
            new Graph(
                "apples",
                "ACTIVE",
                "http://apples.graph/ui",
                "http://apples.graph/rest",
                "UP",
                "federated",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ]);
        component = mount(<ViewGraph />);

        await component.update();
        await component.update();
        await component.update();

        clickExpandRow(component);
        expect(component.find("tr#federated-graph-ids-0").text()).toBe(
            "Federated Graphs: [GetAllGraphIds Operation - Server Error: Timeout exception]"
        );
    });
    it("should not display the row and execute GetALlGraphIds if graph is not Federated Store", async () => {
        await mockGetStoreTypesRepoToReturn({
            storeTypes: ["accumulo", "mapStore", "proxy", "proxyNoContextRoot"],
            federatedStoreTypes: ["federated"],
        });
        await mockGetGraphsToReturn([
            new Graph(
                "apples",
                "ACTIVE",
                "http://apples.graph/ui",
                "http://apples.graph/rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
            new Graph(
                "pears",
                "DELETION IN PROGRESS",
                "http://pears.graph/ui",
                "http://pears.graph/rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ]);
        await act(async () => {
            component = mount(<ViewGraph />);
        });

        await component.update();
        await component.update();
        await clickExpandRow(component);
        expect(component.find("tr#federated-graph-ids-0").length).toBe(0);
    });
});
describe("Integration with GetStoreTypes Repo", () => {
    let component: ReactWrapper;
    afterEach(() => component.unmount());
    it("should display a notification when GetStoreTypes throws an error", async () => {
        await mockGetStoreTypesRepoToThrow(() => {
            throw new APIError("Server Error", "Timeout exception");
        });
        await mockGetGraphsToReturn([
            new Graph(
                "apples",
                "ACTIVE",
                "http://apples.graph/ui",
                "http://apples.graph/rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
            new Graph(
                "pears",
                "DELETION IN PROGRESS",
                "http://pears.graph/ui",
                "http://pears.graph/rest",
                "UP",
                "mapStore",
                "2022-06-09t15:55:34.006",
                GraphType.GAAS_GRAPH
            ),
        ]);

        await act(async () => {
            component = mount(<ViewGraph />);
        });
        await component.update();
        await component.update();
        await component.update();

        expect(GetStoreTypesRepo).toHaveBeenCalledTimes(1);
        expect(component.find("div#notification-alert").text()).toBe(
            "Failed to get federated store types. Server Error: Timeout exception"
        );
    });
});

async function clickRefreshButton(component: ReactWrapper) {
    component.find("button#view-graphs-refresh-button").simulate("click");
    await component.update();
    await component.update();
}

async function clickExpandRow(component: ReactWrapper) {
    component.find("button#expand-row-button-0").simulate("click");
    await component.update();
}

async function mockGetAllGraphIdsRepoToReturn(graphIds: string[]) {
    // @ts-ignore
    GetAllGraphIdsRepo.mockImplementationOnce(() => ({
        get: () =>
            new Promise((resolve, reject) => {
                resolve(graphIds);
            }),
    }));
}

function mockDeleteGraphRepoToThrowError(f: () => void) {
    // @ts-ignore
    DeleteGraphRepo.mockImplementationOnce(() => ({
        delete: f,
    }));
}

function mockGetGraphsToReturn(graphs: Graph[]): void {
    // @ts-ignore
    GetAllGraphsRepo.mockImplementationOnce(() => ({
        getAll: () =>
            new Promise((resolve, reject) => {
                resolve(graphs);
            }),
    }));
}

function mockGetAllGraphsThrowsError(f: () => void): void {
    // @ts-ignore
    GetAllGraphsRepo.mockImplementationOnce(() => ({
        getAll: f,
    }));
}

async function mockGetStoreTypesRepoToReturn(storetypes: IStoreTypes) {
    // @ts-ignore
    GetStoreTypesRepo.mockImplementationOnce(() => ({
        get: () =>
            new Promise((resolve, reject) => {
                resolve(storetypes);
            }),
    }));
}

async function mockGetStoreTypesRepoToThrow(f: () => void) {
    // @ts-ignore
    GetStoreTypesRepo.mockImplementationOnce(() => ({
        get: f,
    }));
}

async function mockGetAllGraphIdsRepoThrowsError(f: () => void) {
    // @ts-ignore
    GetAllGraphIdsRepo.mockImplementationOnce(() => ({
        get: f,
    }));
}
