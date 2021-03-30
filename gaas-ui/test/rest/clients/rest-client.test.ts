import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { RestClient } from "../../../src/rest/clients/rest-client";

const mock = new MockAdapter(axios);

describe("RestClient 2** Responses", () => {
  beforeAll(() =>
    mock
      .onGet("/graphs")
      .reply(200, [{ graphId: "any-graph", currentStatus: "DEPLOYED" }])
      .onGet("/graphs/graph-1")
      .reply(200, { graphId: "graph-1", currentStatus: "DELETED" })
      .onPost("/graphs", { post: "this" })
      .reply(201)
      .onDelete("/graphs/redundant-graph")
      .reply(202)
  );
  afterAll(() => mock.resetHandlers());

  it("should return status/data when GET is successful", async () => {
    const actual = await new RestClient().get().graphs().execute();

    expect(actual).toEqual({
      status: 200,
      data: [
        {
          graphId: "any-graph",
          currentStatus: "DEPLOYED",
        },
      ],
    });
  });
  it("should return status/data when GET with a path variable is successful", async () => {
    const actual = await new RestClient().get().graphs("graph-1").execute();

    expect(actual).toEqual({
      status: 200,
      data: {
        graphId: "graph-1",
        currentStatus: "DELETED",
      },
    });
  });
  it("should return status when POST with request body is successful", async () => {
    const actual = await new RestClient()
      .post()
      .graphs()
      .requestBody({ post: "this" })
      .execute();

    expect(actual).toEqual({
      status: 201,
    });
  });
  it("should return status when DELETE with path variable is successful", async () => {
    const actual = await new RestClient()
      .delete()
      .graphs("redundant-graph")
      .execute();

    expect(actual).toEqual({
      status: 202,
    });
  });
});

describe("RestClient 4**/5** Error Responses", () => {
  beforeAll(() =>
    mock
      .onGet("/graphs")
      .reply(400, {
        title: "Validation Failed",
        detail: "Graph ID can not be null",
      })
      .onGet("/graphs/unfindable-graph")
      .reply(404, { title: "Not Found", detail: "Could not find resource" })
      .onPost("/graphs", { request: "not-found" })
      .reply(500, {
        title: "Server Error",
        detail: "Null pointer in back end API",
      })
      .onDelete("/graphs/already-deleted")
      .reply(504, { title: "Server Error", detail: "Timeout" })
  );
  afterAll(() => mock.resetHandlers());

  it("should throw 400 Error Message when api returns 404", async () => {
    try {
      await new RestClient().get().graphs().execute();
      throw new Error("Error did not throw");
    } catch (e) {
      expect(e.toString()).toBe("Validation Failed: Graph ID can not be null");
    }
  });
  it("should throw 404 Error Message when api returns 404", async () => {
    try {
      await new RestClient().get().graphs("unfindable-graph").execute();
      throw new Error("Error did not throw");
    } catch (e) {
      expect(e.toString()).toBe("Not Found: Could not find resource");
    }
  });
  it("should throw 500 Error Message when api returns 404", async () => {
    try {
      await new RestClient()
        .post()
        .graphs()
        .requestBody({ request: "not-found" })
        .execute();
      throw new Error("Error did not throw");
    } catch (e) {
      expect(e.toString()).toBe("Server Error: Null pointer in back end API");
    }
  });
  it("should throw 504 Error Message when api returns 404", async () => {
    try {
      await new RestClient().delete().graphs("already-deleted").execute();
      throw new Error("Error did not throw");
    } catch (e) {
      expect(e.toString()).toBe("Server Error: Timeout");
    }
  });
});
