import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {RestApiError} from "../../../src/rest/RestApiError";
import {
    ICreateFederatedGraphRequestBody,
} from "../../../src/rest/http-message-interfaces/request-interfaces";
import { CreateFederatedGraphRepo } from "../../../src/rest/repositories/create-federated-graph-repo";

const mock = new MockAdapter(axios);
const repo = new CreateFederatedGraphRepo();

describe("Create Graph Repo", () => {
    describe("On Success", () => {
        it("should request an FEDERATED_STORE  graph when FEDERATED_STORE is parameter", async () => {
            const request: ICreateFederatedGraphRequestBody = {
                proxyStores: [{graphId: "test-graph", url:"test.graph.url"}],
                graphId: "fed-store",
                description: "a description",
                configName: "federated"
            };
            mock.onPost("/graphs", request).reply(201);

            await expect(repo.create("fed-store", "a description", "federated", {proxyStores: [{graphId: "test-graph", url: "test.graph.url"}]})).resolves.toEqual(
                undefined
            );
        });
    });

    describe("Null checks", ()=>{
        it("Should throw an error when configName is Federated and proxyStores is undefined", async () => {
            const config = {};
            await expect(repo.create("bad-request-graph", "a description", "federated", config)).rejects.toEqual(
                new Error("Proxy Stores is undefined")
            );
    });

    describe("On Error", () => {
        it("should throw RestApiError 400 message when API no response body", async () => {
            const request: ICreateFederatedGraphRequestBody = {
                proxyStores: [{graphId: "test-graph", url: "test.graph.url"}],
                graphId: "bad-request-graph",
                description: "a description",
                configName: "federated",
            };
            mock.onPost("/graphs", request).reply(400);

            await expect(repo.create("bad-request-graph", "a description", "federated", {proxyStores: [{graphId: "test-graph", url: "test.graph.url"}]})).rejects.toEqual(
                new RestApiError("Error Code 400", "Bad Request")
            );
        });

        it("should throw RestApiError with title and detail from error response body", async () => {
            const request: ICreateFederatedGraphRequestBody = {
                proxyStores: [{graphId: "test-graph", url: "test.graph.url"}],
                graphId: "forbidden-graph",
                description: "a description",
                configName: "federated",
            };
            mock.onPost("/graphs", request).reply(403, { title: "Forbidden", detail: "Kubernetes access denied" });

            await expect(repo.create("forbidden-graph", "a description", "federated", {proxyStores: [{graphId: "test-graph", url: "test.graph.url"}]})).rejects.toEqual(
                new RestApiError("Forbidden", "Kubernetes access denied")
            );
        });
    });
});
});
