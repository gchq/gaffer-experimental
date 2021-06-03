import React from "react";
import { mount, ReactWrapper } from "enzyme";
import { MainGraphTableRow } from "../../../src/components/view-graphs/main-graph-table-row";
import { Graph } from "../../../src/domain/graph";
import { GraphType } from "../../../src/domain/graph-type";
import { StoreType } from "../../../src/domain/store-type";
import { GetAllGraphIdsRepo } from "../../../src/rest/repositories/gaffer/get-all-graph-ids-repo";
import {act} from "react-dom/test-utils";
import {RestApiError} from "../../../src/rest/RestApiError";

jest.mock("../../../src/rest/repositories/gaffer/get-all-graph-ids-repo");

describe("Main Graph Table Row", () => {
  it("should display federated graph ids as a list of strings", async () => {
    mockGetAllGraphIdsRepoToReturn(["accumulo-graph-1", "accumulo-graph-2"]);
    const component: ReactWrapper = mount(
      <MainGraphTableRow
        index={0}
        graph={new Graph( "fed-graph", "", "http://fed-graph.k8s.cluster/rest",  "UP", StoreType.FEDERATED_STORE, GraphType.GAAS_GRAPH)}
        onClickDelete={() => {}}
      />
    );
    await act(async ()=>{
      component.find("button#expand-row-button-0").simulate("click");
    })
    await  component.update();
    expect(component.find("tr#federated-graph-ids-0").text()).toBe(
      "Federated Graphs: accumulo-graph-1, accumulo-graph-2"
    );
  });
  it("should not display any graph ids when GetAllGraphIds returns and empty array", async () => {
    mockGetAllGraphIdsRepoToReturn([]);
    const component: ReactWrapper = mount(
        <MainGraphTableRow
            index={0}
            graph={new Graph( "fed-graph", "", "http://fed-graph.k8s.cluster/rest",  "UP", StoreType.FEDERATED_STORE, GraphType.GAAS_GRAPH)}
            onClickDelete={() => {}}
        />
    );
    await act(async ()=>{
      component.find("button#expand-row-button-0").simulate("click");
    })
    await  component.update();
    expect(component.find("tr#federated-graph-ids-0").text()).toBe(
        "No Federated Graphs"
    );
  });
  it("should display an error if GetAllGraphIds throws an error when called", () => {
    mockGetAllGraphIdsRepoThrowsError(() => { throw new RestApiError("Not Found", "Resource not found")})

  })
});

function mockGetAllGraphIdsRepoToReturn(graphIds: string[]) {
  // @ts-ignore
  GetAllGraphIdsRepo.mockImplementationOnce(() => ({
    get: () =>
      new Promise((resolve, reject) => {
        resolve(graphIds);
      }),
  }));

}
function mockGetAllGraphIdsRepoThrowsError(f: () => void): void {
  // @ts-ignore
  GetAllGraphIdsRepo.mockImplementationOnce(() => ({
    get: f,
  }))
}