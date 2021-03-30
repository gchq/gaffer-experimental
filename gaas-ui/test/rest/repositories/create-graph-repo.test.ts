import { CreateGraphRepo } from "../../../src/rest/repositories/create-graph-repo";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { TypesSchema } from "../../../src/domain/types-schema";
import { ElementsSchema } from "../../../src/domain/elements-schema";
import { RestApiError } from "../../../src/rest/RestApiError";

const mock = new MockAdapter(axios);
const repo = new CreateGraphRepo();

describe("Create Graph Repo", () => {
  describe("On Success", () => {
    it("should called with ", async () => {
      mock.onPost("/graphs").reply(201);
      const elements = new ElementsSchema(
        JSON.stringify({ entities: {}, edges: {} })
      );
      const types = new TypesSchema(JSON.stringify({ types: {} }));

      await expect(repo.create("ok", [], elements, types)).resolves.toEqual(
        undefined
      );
    });

    it("should called with ", async () => {
      mock.onPost("/graphs").reply(200);
      const elements = new ElementsSchema(
        JSON.stringify({ entities: {}, edges: {} })
      );
      const types = new TypesSchema(JSON.stringify({ types: {} }));

      await expect(repo.create("bad", [], elements, types)).rejects.toEqual(
        new Error("Expected status code 201 for Created Graph but got (200)")
      );
    });
  });

  describe("On Error", () => {
    it("should throw RestApiError 400 message when API no response body", async () => {
      mock.onPost("/graphs").reply(400);
      const elements = new ElementsSchema(
        JSON.stringify({ entities: {}, edges: {} })
      );
      const types = new TypesSchema(JSON.stringify({ types: {} }));

      await expect(repo.create("bad", [], elements, types)).rejects.toEqual(
        new RestApiError("Error Code 400", "Bad Request")
      );
    });

    it("should throw RestApiError with title and detail from response body", async () => {
      mock
        .onPost("/graphs")
        .reply(403, { title: "Forbidden", detail: "Kubernetes access denied" });
      const elements = new ElementsSchema(
        JSON.stringify({ entities: {}, edges: {} })
      );
      const types = new TypesSchema(JSON.stringify({ types: {} }));

      await expect(repo.create("bad", [], elements, types)).rejects.toEqual(
        new RestApiError("Forbidden", "Kubernetes access denied")
      );
    });

    it("should throw Unknown RestApiError when no error and response body", async () => {
      mock.onPost("/graphs").reply(0);
      const elements = new ElementsSchema(
        JSON.stringify({ entities: {}, edges: {} })
      );
      const types = new TypesSchema(JSON.stringify({ types: {} }));

      await expect(repo.create("bad", [], elements, types)).rejects.toEqual(
        new RestApiError("Unknown Error", "Unable to make request")
      );
    });
  });
});
