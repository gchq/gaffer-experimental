import React from "react";
import { mount, ReactWrapper } from "enzyme";
import ViewGraph from "../../../src/components/view-graphs/view-graphs";
import { GetAllGraphsRepo } from "../../../src/rest/repositories/get-all-graphs-repo";
import { Graph } from "../../../src/domain/graph";
import { DeleteGraphRepo } from "../../../src/rest/repositories/delete-graph-repo";
import { RestApiError } from "../../../src/rest/RestApiError";

jest.mock("../../../src/rest/repositories/get-all-graphs-repo");
jest.mock("../../../src/rest/repositories/delete-graph-repo");

afterEach(() => jest.resetAllMocks());

describe("When ViewGraphs mounts", () => {
    it("should display Table Headers and Graphs when GetGraphs successful", async () => {
        mockGetGraphsToReturn([new Graph("testId1", "deployed", "testId1 URL", "UP")]);

        const component = mount(<ViewGraph />);
        await component.update();
        await component.update();

        expect(component.find("thead").text()).toBe("Graph IDDescriptionStatusActions");
        expect(component.find("tbody").text()).toBe("testId1deployedUP");
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
            throw new RestApiError("Client Error", "404 Not Found");
        });

        const component = mount(<ViewGraph />);

        expect(component.find("div#notification-alert").text()).toBe(
            "Failed to get all graphs. Client Error: 404 Not Found"
        );
    });
    it("should not display Error AlertNotification when GetGraphs request successful", async () => {
        mockGetGraphsToReturn([new Graph("roadTraffic", "DEPLOYED", "roadTraffic URL", "UP")]);

        const component = mount(<ViewGraph />);
        await component.update();

        const table = component.find("table");
        expect(table).toHaveLength(1);
        expect(table.find("tbody").text()).toBe("roadTrafficDEPLOYEDUP");
        expect(component.find("div#notification-alert").length).toBe(0);
    });
});

describe("Refresh Button", () => {
    it("should call GetGraphs again when refresh button clicked", async () => {
        mockGetGraphsToReturn([new Graph("roadTraffic", "DEPLOYING", "roadTraffic URL", "UP")]);

        const component = mount(<ViewGraph />);
        await component.update();
        expect(component.find("tbody").text()).toBe("roadTrafficDEPLOYINGUP");

        mockGetGraphsToReturn([new Graph("roadTraffic", "FINISHED DEPLOYMENT", "roadTraffic URL", "UP")]);
        await clickRefreshButton(component);

        expect(component.find("tbody").text()).toBe("roadTrafficFINISHED DEPLOYMENTUP");
    });
    it("should reset an existing error message when refresh button is clicked", async () => {
        mockGetAllGraphsThrowsError(() => {
            throw new RestApiError("Server Error", "Timeout exception");
        });

        const component = mount(<ViewGraph />);
        expect(component.find("div#notification-alert").text()).toBe(
            "Failed to get all graphs. Server Error: Timeout exception"
        );

        mockGetGraphsToReturn([new Graph("roadTraffic", "FINISHED DEPLOYMENT", "roadTraffic URL", "UP")]);
        await clickRefreshButton(component);

        expect(component.find("div#notification-alert").length).toBe(0);
    });
});

describe("Delete Button", () => {
    it("should send a delete request when the delete button has been clicked", async () => {
        DeleteGraphRepo.prototype.delete = jest.fn();
        mockGetGraphsToReturn([new Graph("peaches", "ACTIVE", "peaches URL", "UP")]);

        const component = mount(<ViewGraph />);
        await component.update();
        await component.update();
        expect(component.find("tbody").text()).toBe("peachesACTIVEUP");

        mockGetGraphsToReturn([new Graph("peaches", "DELETED", "peaches URL", "UP")]);
        component.find("tbody").find("button#view-graphs-delete-button-0").simulate("click");
        await component.update();
        await component.update();

        expect(DeleteGraphRepo.prototype.delete).toHaveBeenLastCalledWith("peaches");
    });
    it("should send a delete request for correct graphId from many graphs when the delete button has been clicked", async () => {
        DeleteGraphRepo.prototype.delete = jest.fn();
        mockGetGraphsToReturn([new Graph("apples", "ACTIVE", "apples URL", "UP"), new Graph("pears", "INACTIVE", "pears URL",  "UP")]);

        const component = mount(<ViewGraph />);
        await component.update();
        await component.update();
        expect(component.find("tbody").text()).toBe("applesACTIVEUPpearsINACTIVEUP");

        mockGetGraphsToReturn([new Graph("apples", "ACTIVE", "apples URL", "UP"), new Graph("pears", "DELETED", "pears URL", "UP")]);
        component.find("tbody").find("button#view-graphs-delete-button-1").simulate("click");
        await component.update();
        await component.update();

        expect(DeleteGraphRepo.prototype.delete).toHaveBeenLastCalledWith("pears");
    });
    it("should change the current status of the graph when the delete button is clicked", async () => {
        DeleteGraphRepo.prototype.delete = jest.fn();
        mockGetGraphsToReturn([new Graph("apples", "ACTIVE", "apples URL", "UP"), new Graph("pears", "INACTIVE", "pears URL", "UP")]);

        const component = mount(<ViewGraph />);
        await component.update();
        await component.update();
        expect(component.find("tbody").text()).toBe("applesACTIVEUPpearsINACTIVEUP");

        mockGetGraphsToReturn([new Graph("apples", "ACTIVE", "apples URL", "UP"), new Graph("pears", "DELETION IN PROGRESS", "pears URL", "UP")]);
        component.find("tbody").find("button#view-graphs-delete-button-1").simulate("click");
        await component.update();
        await component.update();
        await component.update();

        expect(component.find("tbody").text()).toBe("applesACTIVEUPpearsDELETION IN PROGRESSUP");
    });
    it("should notify error and not refresh graphs when delete request returns server error", async () => {
        mockDeleteGraphRepoToThrowError(() => {
            throw new RestApiError("Server Error", "Timeout exception");
        });
        mockGetGraphsToReturn([new Graph("bananas", "INACTIVE", "bananas URL", "UP")]);

        const component = mount(<ViewGraph />);
        await component.update();
        await component.update();
        expect(component.find("tbody").text()).toBe("bananasINACTIVEUP");

        component.find("tbody").find("button#view-graphs-delete-button-0").simulate("click");
        await component.update();

        // Only call GetGraphsRepo on mount and not 2nd time when delete graph is unsuccessful
        expect(GetAllGraphsRepo).toBeCalledTimes(1);
        expect(component.find("div#notification-alert").text()).toBe(
            'Failed to delete graph "bananas". Server Error: Timeout exception'
        );
    });
});

async function clickRefreshButton(component: ReactWrapper) {
    component.find("button#view-graphs-refresh-button").simulate("click");
    await component.update();
    await component.update();
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
