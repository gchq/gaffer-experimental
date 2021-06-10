import React from "react";
import { mount, ReactWrapper } from "enzyme";
import { act } from "react-dom/test-utils";
import { MainGraphTableRow } from "../../../src/components/view-graphs/main-graph-table-row";
import { Graph } from "../../../src/domain/graph";
import { GraphType } from "../../../src/domain/graph-type";
import {GetStoreTypesRepo} from "../../../src/rest/repositories/get-store-types-repo";
import { GetAllGraphIdsRepo } from "../../../src/rest/repositories/gaffer/get-all-graph-ids-repo";
import { RestApiError } from "../../../src/rest/RestApiError";
import {IStoreTypesResponse} from "../../../src/rest/http-message-interfaces/response-interfaces";

jest.mock("../../../src/rest/repositories/gaffer/get-all-graph-ids-repo");
jest.mock("../../../src/rest/repositories/get-store-types-repo")

afterEach(() => jest.resetAllMocks());

describe("Main Graph Table Row", () => {
  fit("should display federated graph ids as a list of strings", async () => {
    await mockGetStoreTypesRepoToReturn({
      storeTypes: [
        "accumulo",
        "mapStore",
        "proxy",
        "proxyNoContextRoot"
      ],
      federatedStoreTypes: [
        "federated"
      ]
    })
    await mockGetAllGraphIdsRepoToReturn(["accumulo-graph-1", "accumulo-graph-2"]);
    const component: ReactWrapper = mount(
      <MainGraphTableRow
        index={0}
        graph={new Graph( "fed-graph", "test", "http://fed-graph.k8s.cluster/rest",  "UP", "federated", GraphType.GAAS_GRAPH)}
        onClickDelete={() => {}}
      />
    );
    await component.update();
    await component.update();
    await clickExpandRow(component);
    console.log(component.html());
    expect(component.find("tr#federated-graph-ids-0").text()).toBe(
      "Federated Graphs: accumulo-graph-1, accumulo-graph-2"
    );
  });

  it("should not display any graph ids when GetAllGraphIds returns and empty array", async () => {
    await mockGetStoreTypesRepoToReturn({
      storeTypes: [
        "accumulo",
        "mapStore",
        "proxy",
        "proxyNoContextRoot"
      ],
      federatedStoreTypes: [
        "federated"
      ]
    })
    const component: ReactWrapper = mount(
        <MainGraphTableRow
            index={0}
            graph={new Graph( "fed-graph", "test", "http://fed-graph.k8s.cluster/rest",  "UP", "federated", GraphType.GAAS_GRAPH)}
            onClickDelete={() => {}}
        />
    );
    await mockGetAllGraphIdsRepoToReturn([]);
    await component.update();
    await clickExpandRow(component);

    expect(component.find("tr#federated-graph-ids-0").text()).toBe(
        "No Federated Graphs"
    );
  });
  fit("should display an error if GetAllGraphIds throws an error when called", async () => {
    await mockGetStoreTypesRepoToReturn({
      storeTypes: [
        "accumulo",
        "mapStore",
        "proxy",
        "proxyNoContextRoot"
      ],
      federatedStoreTypes: [
        "federated"
      ]
    })
    await mockGetAllGraphIdsRepoThrowsError(new RestApiError("Not Found", "Resource not found"));

    const component: ReactWrapper = mount(
      <MainGraphTableRow
          index={0}
          graph={new Graph( "fed-graph", "test", "http://fed-graph.k8s.cluster/rest",  "UP", "federated", GraphType.GAAS_GRAPH)}
          onClickDelete={() => {}}
      />
  );

    await clickExpandRow(component);

    expect(component.find("tr#federated-graph-ids-0").text()).toBe(
        "Federated Graphs: [GetAllGraphIds Operation - Not Found]"
    );
  });
  it("should not display the row and execute GetALlGraphIds if graph is not Federated Store", async () => {
    await mockGetStoreTypesRepoToReturn({
      storeTypes: [
        "accumulo",
        "mapStore",
        "proxy",
        "proxyNoContextRoot"
      ],
      federatedStoreTypes: [
        "federated"
      ]
    })
    const component: ReactWrapper = mount(
      <MainGraphTableRow
          index={0}
          graph={new Graph( "fed-graph", "test", "http://fed-graph.k8s.cluster/rest",  "UP", "mapStore", GraphType.GAAS_GRAPH)}
          onClickDelete={() => {}}
      />
  );

    await clickExpandRow(component);

    expect(component.find("tr#federated-graph-ids-0").length).toBe(0);
    expect(GetAllGraphIdsRepo).toBeCalledTimes(0);
  });
});

async function clickExpandRow(component: ReactWrapper) {
    component.find("button#expand-row-button-0").simulate("click");
  await  component.update();
}

function mockGetAllGraphIdsRepoToReturn(graphIds: string[]) {
  // @ts-ignore
  GetAllGraphIdsRepo.mockImplementationOnce(() => ({
    get: () =>
      new Promise((resolve, reject) => {
        resolve(graphIds);
      }),
  }));
}
function mockGetStoreTypesRepoToReturn(storetypes: IStoreTypesResponse) {
  // @ts-ignore
  GetStoreTypesRepo.mockImplementationOnce(() => ({
    get: () =>
      new Promise((resolve, reject) => {
        resolve(storetypes);
      }),
  }));
}

function mockGetAllGraphIdsRepoThrowsError(error: RestApiError): void {
  // @ts-ignore
  GetAllGraphIdsRepo.mockImplementationOnce(() => ({
    get: () => { throw error; },
  }));
}
