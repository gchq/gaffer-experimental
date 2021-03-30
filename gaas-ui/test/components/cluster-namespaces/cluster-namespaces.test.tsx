import { mount, ReactWrapper } from "enzyme";
import React from "react";
import ClusterNamespaces from "../../../src/components/cluster-namespaces/cluster-namespaces";
import { GetAllNamespacesRepo } from "../../../src/rest/repositories/get-all-namespaces-repo";
import { RestApiError } from "../../../src/rest/RestApiError";

jest.mock("../../../src/rest/repositories/get-all-namespaces-repo");
afterEach(() => jest.resetAllMocks());

describe("When ViewGraphs mounts", () => {
    it("should display table headers and namespaces when GetNamespaces is successful", async () => {
        mockGetNamespacesToReturn(["namespace1"]);

        const component = mount(<ClusterNamespaces />);
        await component.update();
        await component.update();

        expect(component.find("thead").text()).toBe("Namespaces");
        expect(component.find("tbody").text()).toBe("namespace1");
        expect(component.find("caption").length).toBe(0);
    });
    it("should display No Namespaces when there are no namespaces", async () => {
        mockGetNamespacesToReturn([]);

        const component = mount(<ClusterNamespaces />);
        await component.update();
        await component.update();

        expect(component.find("caption").text()).toBe("No Namespaces");
    });
    it("should display Error Message in AlertNotification when GetGraphs request fails", () => {
        mockGetNamespacesThrowsErrors(() => {
            throw new RestApiError("Client Error", "404 Not Found");
        });

        const component = mount(<ClusterNamespaces />);

        expect(component.find("div#notification-alert").text()).toBe(
            "Failed to get all namespaces. Client Error: 404 Not Found"
        );
    });
    it("should not display Error AlertNotification when GetNamespaces request successful", async () => {
        mockGetNamespacesToReturn(["namespace1", "namespace2"]);

        const component = mount(<ClusterNamespaces />);
        await component.update();

        const table = component.find("table");
        expect(table).toHaveLength(1);
        expect(table.find("tbody").text()).toBe("namespace1namespace2");
        expect(component.find("div#notification-alert").length).toBe(0);
    });
});
describe("Refresh Button", () => {
    it("should call GetNamespaces again when refresh button clicked", async () => {
        mockGetNamespacesToReturn(["namespace1", "namespace2"]);

        const component = mount(<ClusterNamespaces />);
        await component.update();
        expect(component.find("tbody").text()).toBe("namespace1namespace2");

        mockGetNamespacesToReturn(["namespace1"]);
        await clickRefreshButton(component);

        expect(component.find("tbody").text()).toBe("namespace1");
    });
    it("should reset an existing error message when refresh button is clicked", async () => {
        mockGetNamespacesThrowsErrors(() => {
            throw new RestApiError("Server Error", "Timeout exception");
        });

        const component = mount(<ClusterNamespaces />);
        expect(component.find("div#notification-alert").text()).toBe(
            "Failed to get all namespaces. Server Error: Timeout exception"
        );

        mockGetNamespacesToReturn(["namespace1", "namespace2"]);
        await clickRefreshButton(component);

        expect(component.find("div#notification-alert").length).toBe(0);
    });
});
function mockGetNamespacesToReturn(namespaces: string[]): void {
    // @ts-ignore
    GetAllNamespacesRepo.mockImplementationOnce(() => ({
        getAll: () =>
            new Promise((resolve, reject) => {
                resolve(namespaces);
            }),
    }));
}

function mockGetNamespacesThrowsErrors(f: () => void): void {
    // @ts-ignore
    GetAllNamespacesRepo.mockImplementationOnce(() => ({
        getAll: f,
    }));
}
async function clickRefreshButton(component: ReactWrapper) {
    component.find("button#namespaces-refresh-button").simulate("click");
    await component.update();
    await component.update();
}
