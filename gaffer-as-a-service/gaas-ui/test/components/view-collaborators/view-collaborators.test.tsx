/*
 * Copyright 2022 Crown Copyright
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
import { GraphCollaborator } from "../../../src/domain/graph-collaborator";
import ViewCollaborators from "../../../src/components/view-collaborators/view-collaborators";
import { GetAllGraphCollaboratorsRepo } from "../../../src/rest/repositories/get-all-graph-collaborators-repo";

jest.mock("../../../src/rest/repositories/get-all-graph-collaborators-repo");

const mockedUsedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLocation: () => ({ state: { graphId: "graphId" } }),
}));

afterEach(() => {
    jest.resetAllMocks();
});

describe("When ViewCollaborators mounts", () => {
    it("should display Table Headers and Collaborators when GetCollaborators successful", async () => {
        mockGetAllGraphCollaboratorsToReturn([new GraphCollaborator("myGraph", "myUser")]);

        const wrapper: ReactWrapper = mount(
            <ViewCollaborators
                graphId={"myGraph"}
                errorMessage={"someMessage"}
                graphCollaborators={[new GraphCollaborator("myGraph", "myUser")]}
            />
        );
        await wrapper.update();
        await wrapper.update();

        expect(wrapper.find("thead").text()).toBe("Graph IDUser NameActions");
        expect(wrapper.find("tbody").text()).toBe("myGraphmyUser");
        expect(wrapper.find("caption").length).toBe(0);
    });
    it("should display No Collaborators caption when there are no collaborators", async () => {
        mockGetAllGraphCollaboratorsToReturn([]);

        const wrapper: ReactWrapper = mount(
            <ViewCollaborators
                graphId={"myGraph"}
                errorMessage={"someMessage"}
                graphCollaborators={[new GraphCollaborator("myGraph", "myUser")]}
            />
        );
        await wrapper.update();
        await wrapper.update();

        expect(wrapper.find("caption").text()).toBe("No Collaborators.");
    });
    it("should display Error Message in AlertNotification when GetGraphs request fails", async () => {
        mockGetAllGraphCollaboratorsThrowsError(() => {
            throw new APIError("Client Error", "404 Not Found");
        });

        const wrapper: ReactWrapper = mount(
            <ViewCollaborators
                graphId={"myGraph"}
                errorMessage={"someMessage"}
                graphCollaborators={[new GraphCollaborator("myGraph", "myUser")]}
            />
        );
        await wrapper.update();
        await wrapper.update();

        expect(wrapper.find("div#notification-alert").text()).toBe(
            "Failed to get all graph collaborators. Client Error: 404 Not Found"
        );
    });
    // it("should not display Error AlertNotification when GetGraphs request successful", async () => {
    //     mockGetGraphsToReturn([
    //         new Graph(
    //             "roadTraffic",
    //             "DEPLOYED",
    //             "http://roadTraffic.graph/ui",
    //             "http://roadTraffic.graph/rest",
    //             "UP",
    //             "mapStore",
    //             "2022-06-09t15:55:34.006",
    //             GraphType.GAAS_GRAPH
    //         ),
    //     ]);

    //     const component = mount(<ViewGraph />);
    //     await component.update();

    //     const table = component.find("table");
    //     expect(table).toHaveLength(1);
    //     expect(table.find("tbody").text()).toBe(
    //         "roadTraffic MUPhttp://roadTraffic.graph/uihttp://roadTraffic.graph/rest2022-06-09t15:55:34.006"
    //     );
    //     expect(component.find("div#notification-alert").length).toBe(0);
    // });
    // it("should display a down status in the status column when the graph status is down", async () => {
    //     mockGetGraphsToReturn([
    //         new Graph(
    //             "roadTraffic",
    //             "DEPLOYED",
    //             "http://roadTraffic.graph/ui",
    //             "http://roadTraffic.graph/rest",
    //             "DOWN",
    //             "mapStore",
    //             "2022-06-09t15:55:34.006",
    //             GraphType.GAAS_GRAPH
    //         ),
    //     ]);

    //     const component = mount(<ViewGraph />);
    //     await component.update();

    //     const table = component.find("table");
    //     expect(table.find("tbody").text()).toBe(
    //         "roadTraffic MDOWNhttp://roadTraffic.graph/uihttp://roadTraffic.graph/rest2022-06-09t15:55:34.006"
    //     );
    // });
});

// describe("Integration with GetAllGraphIds repo", () => {
//     let component: ReactWrapper;
//     afterEach(() => {
//         component.unmount();
//     });
// it("should display federated graph ids as a list of strings", async () => {
//     await mockGetStoreTypesRepoToReturn({
//         storeTypes: ["accumulo", "mapStore", "proxy", "proxyNoContextRoot"],
//         federatedStoreTypes: ["federated"],
//     });
//     await mockGetGraphsToReturn([
//         new Graph(
//             "apples",
//             "ACTIVE",
//             "http://apples.graph/ui",
//             "http://apples.graph/rest",
//             "UP",
//             "federated",
//             "2022-06-09t15:55:34.006",
//             GraphType.GAAS_GRAPH
//         ),
//         new Graph(
//             "pears",
//             "DELETION IN PROGRESS",
//             "http://pears.graph/ui",
//             "http://pears.graph/rest",
//             "UP",
//             "mapStore",
//             "2022-06-09t15:55:34.006",
//             GraphType.GAAS_GRAPH
//         ),
//     ]);
//     await act(async () => {
//         component = mount(<ViewGraph />);
//     });
//     await act(async () => {
//         await mockGetAllGraphIdsRepoToReturn(["accumulo-graph-1", "accumulo-graph-2"]);
//     });

//     await component.update();
//     await component.update();
//     await clickExpandRow(component);
//     expect(component.find("tr#federated-graph-ids-0").text()).toBe(
//         "Federated Graphs: accumulo-graph-1, accumulo-graph-2"
//     );
// });
// it("should not display any graph ids when GetAllGraphIds returns and empty array", async () => {
//     await mockGetStoreTypesRepoToReturn({
//         storeTypes: ["accumulo", "mapStore", "proxy", "proxyNoContextRoot"],
//         federatedStoreTypes: ["federated"],
//     });
//     await mockGetGraphsToReturn([
//         new Graph(
//             "apples",
//             "ACTIVE",
//             "http://apples.graph/ui",
//             "http://apples.graph/rest",
//             "UP",
//             "federated",
//             "2022-06-09t15:55:34.006",
//             GraphType.GAAS_GRAPH
//         ),
//         new Graph(
//             "pears",
//             "DELETION IN PROGRESS",
//             "http://pears.graph/ui",
//             "http://pears.graph/rest",
//             "UP",
//             "mapStore",
//             "2022-06-09t15:55:34.006",
//             GraphType.GAAS_GRAPH
//         ),
//     ]);
//     await act(async () => {
//         component = mount(<ViewGraph />);
//     });
//     await act(async () => {
//         await mockGetAllGraphIdsRepoToReturn([]);
//     });

//     await component.update();
//     await component.update();
//     await clickExpandRow(component);
//     expect(component.find("tr#federated-graph-ids-0").text()).toBe("No Federated Graphs");
// });
// it("should display an error if GetAllGraphIds throws an error when called", async () => {
//     await act(async () => {
//         mockGetAllGraphIdsRepoThrowsError(() => {
//             throw new APIError("Server Error", "Timeout exception");
//         });
//     });
//     mockGetStoreTypesRepoToReturn({
//         storeTypes: ["accumulo", "mapStore", "proxy", "proxyNoContextRoot"],
//         federatedStoreTypes: ["federated"],
//     });
//     mockGetGraphsToReturn([
//         new Graph(
//             "apples",
//             "ACTIVE",
//             "http://apples.graph/ui",
//             "http://apples.graph/rest",
//             "UP",
//             "federated",
//             "2022-06-09t15:55:34.006",
//             GraphType.GAAS_GRAPH
//         ),
//     ]);
//     component = mount(<ViewGraph />);

//     await component.update();
//     await component.update();
//     await component.update();

//     clickExpandRow(component);
//     expect(component.find("tr#federated-graph-ids-0").text()).toBe(
//         "Federated Graphs: [GetAllGraphIds Operation - Server Error: Timeout exception]"
//     );
// });
// it("should not display the row and execute GetALlGraphIds if graph is not Federated Store", async () => {
//     await mockGetStoreTypesRepoToReturn({
//         storeTypes: ["accumulo", "mapStore", "proxy", "proxyNoContextRoot"],
//         federatedStoreTypes: ["federated"],
//     });
//     await mockGetGraphsToReturn([
//         new Graph(
//             "apples",
//             "ACTIVE",
//             "http://apples.graph/ui",
//             "http://apples.graph/rest",
//             "UP",
//             "mapStore",
//             "2022-06-09t15:55:34.006",
//             GraphType.GAAS_GRAPH
//         ),
//         new Graph(
//             "pears",
//             "DELETION IN PROGRESS",
//             "http://pears.graph/ui",
//             "http://pears.graph/rest",
//             "UP",
//             "mapStore",
//             "2022-06-09t15:55:34.006",
//             GraphType.GAAS_GRAPH
//         ),
//     ]);
//     await act(async () => {
//         component = mount(<ViewGraph />);
//     });

//     await component.update();
//     await component.update();
//     await clickExpandRow(component);
//     expect(component.find("tr#federated-graph-ids-0").length).toBe(0);
// });
//});

async function clickExpandRow(component: ReactWrapper) {
    component.find("button#expand-row-button-0").simulate("click");
    await component.update();
}

async function mockGetAllGraphIdsRepoToReturn(graphIds: string[]) {
    // @ts-ignore
    GetAllGraphIdsRepo.mockImplementationOnce(() => ({
        get: () =>
            new Promise((resolve) => {
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

function mockGetAllGraphCollaboratorsToReturn(graphCollaborators: GraphCollaborator[]): void {
    // @ts-ignore
    GetAllGraphCollaboratorsRepo.mockImplementationOnce(() => ({
        getAll: (graphId: string) =>
            new Promise((resolve) => {
                resolve(graphCollaborators);
            }),
    }));
}

function mockGetAllGraphCollaboratorsThrowsError(f: () => void): void {
    // @ts-ignore
    GetAllGraphCollaboratorsRepo.mockImplementationOnce(() => ({
        getAll: f,
    }));
}

async function mockGetStoreTypesRepoToReturn(storetypes: IStoreTypes) {
    // @ts-ignore
    GetStoreTypesRepo.mockImplementationOnce(() => ({
        get: () =>
            new Promise((resolve) => {
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
