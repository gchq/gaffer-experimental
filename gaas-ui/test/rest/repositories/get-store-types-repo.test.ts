import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { IStoreTypesResponse } from "../../../src/rest/http-message-interfaces/response-interfaces";
import { GetStoreTypesRepo, IStoreTypes } from "../../../src/rest/repositories/get-store-types-repo";
import { RestApiError } from "../../../src/rest/RestApiError";

const mock = new MockAdapter(axios);
const repo = new GetStoreTypesRepo();

afterEach(() => mock.resetHandlers());

describe("Get Store Types Repository", () => {
  it("should return a list of store type config names", async () => {
    const apiResponse: IStoreTypesResponse = {
      storeTypes: [
        {
          name: "accumuloSmall",
          parameters: [
            "schema"
          ]
        },
        {
          name: "accumulo",
          parameters: [
            "schema"
          ]
        },
        {
          name: "proxy",
          parameters: [
            "schema"
          ]
        },
        {
          name: "mapStore",
          parameters: [
            "schema"
          ]
        },
        {
          name: "accumuloBig",
          parameters: [
            "schema"
          ]
        },
        {
          name: "federated",
          parameters: [
            "proxies"
          ]
        }
      ]
    };
    mock.onGet("/storetypes").reply(200, apiResponse);

    const actual: IStoreTypes = await repo.get();

    const expectedStoretypes = [ "accumuloSmall", "accumulo", "proxy", "mapStore","accumuloBig"];
    const expectedFederatedStoreTypes = ["federated"];

    expect(actual.storeTypes).toEqual(expectedStoretypes);
    expect(actual.federatedStoreTypes).toEqual(expectedFederatedStoreTypes);
  });

  it("should throw RestApiError with correct status message when no response body", async () => {
    mock.onGet("/storetypes").reply(404);

    await expect(repo.get()).rejects.toEqual(
      new RestApiError("Error Code 404", "Not Found")
    );
  });

  it("should throw RestApiError with title and detail from response body", async () => {
    mock
      .onGet("/storetypes")
      .reply(403, { title: "Forbidden", detail: "Graph is invalid" });

    await expect(repo.get()).rejects.toEqual(
      new RestApiError("Forbidden", "Graph is invalid")
    );
  });

  it("should throw unknown RestApiError when undefined status and body", async () => {
    mock.onGet("/storetypes").reply(0);

    await expect(repo.get()).rejects.toEqual(
      new RestApiError("Unknown Error", "Unable to make request")
    );
  });
});
