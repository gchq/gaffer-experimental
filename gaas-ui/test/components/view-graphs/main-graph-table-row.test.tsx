import React from "react";
import { mount, ReactWrapper } from "enzyme";
import { MainGraphTableRow } from "../../../src/components/view-graphs/main-graph-table-row";
import { Graph } from "../../../src/domain/graph";
import { GraphType } from "../../../src/domain/graph-type";
import { StoreType } from "../../../src/domain/store-type";
import { GetAllGraphIdsRepo } from "../../../src/rest/repositories/gaffer/get-all-graph-ids-repo";

jest.mock("../../../src/rest/repositories/gaffer/get-all-graph-ids-repo");

describe("Main Graph Table Row", () => {
  it("should display federated graph ids as a list of strings", () => {
    mockGetAllGraphIdsRepoToReturn(["accumulo-graph-1", "accumulo-graph-2"]);
    const component: ReactWrapper = mount(
      <MainGraphTableRow
        index={0}
        graph={new Graph( "fed-graph", "", "http://fed-graph.k8s.cluster/rest",  "UP", StoreType.FEDERATED_STORE, GraphType.GAAS_GRAPH)}
        onClickDelete={() => {}}
      />
    );

    component.find("")

    expect(component.html()).toBe(
      "Federated Graphs: accumulo-graph-1, accumulo-graph-2"
    );
    // expect(component.find("tr#federated-graph-ids-0").text()).toBe(
    //   "Federated Graphs: accumulo-graph-1, accumulo-graph-2"
    // );
  });
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
