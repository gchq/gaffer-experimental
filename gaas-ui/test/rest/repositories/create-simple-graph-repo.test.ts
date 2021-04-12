import { CreateSimpleGraphRepo } from "../../../src/rest/repositories/create-simple-graph-repo";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { RestApiError } from "../../../src/rest/RestApiError";
import { ICreateSimpleGraphRequestBody } from "../../../src/rest/http-message-interfaces/request-interfaces";
import { StoreType } from "../../../src/domain/store-type";

const mock = new MockAdapter(axios);
const repo = new CreateSimpleGraphRepo();

describe("Create Graph Repo", () => {
    describe("On Success", () => {
        it("should request an ACCUMULO store graph when ACCUMULO is paramete", async () => {
            const request: ICreateSimpleGraphRequestBody = {
                graphId: "accumulo-graph",
                description: "a description",
                storeType: StoreType.ACCUMULO,
                proxyStores: "",
                root: "",
            };
            mock.onPost("/graphs", request).reply(201);

            await expect(repo.create("accumulo-graph", "a description", StoreType.ACCUMULO, "", "")).resolves.toEqual(
                undefined
            );
        });

        it("should request an ACCUMULO store graph when MAPSTORE is paramete", async () => {
            const request: ICreateSimpleGraphRequestBody = {
                graphId: "map-graph",
                description: "a description",
                storeType: StoreType.MAPSTORE,
                proxyStores: "",
                root: "",
            };
            mock.onPost("/graphs", request).reply(201);

            await expect(repo.create("map-graph", "a description", StoreType.MAPSTORE, "", "")).resolves.toEqual(
                undefined
            );
        });
    });

    describe("On Error", () => {
        it("should throw RestApiError 400 message when API no response body", async () => {
            const request: ICreateSimpleGraphRequestBody = {
                graphId: "bad-request-graph",
                description: "a description",
                storeType: StoreType.MAPSTORE,
                proxyStores: "",
                root: "",
            };
            mock.onPost("/graphs", request).reply(400);

            await expect(repo.create("bad-request-graph", "a description", StoreType.MAPSTORE, "", "")).rejects.toEqual(
                new RestApiError("Error Code 400", "Bad Request")
            );
        });

        it("should throw RestApiError with title and detail from error response body", async () => {
            const request: ICreateSimpleGraphRequestBody = {
                graphId: "forbidden-graph",
                description: "a description",
                storeType: StoreType.MAPSTORE,
                proxyStores: "",
                root: "",
            };
            mock.onPost("/graphs", request).reply(403, { title: "Forbidden", detail: "Kubernetes access denied" });

            await expect(repo.create("forbidden-graph", "a description", StoreType.MAPSTORE, "", "")).rejects.toEqual(
                new RestApiError("Forbidden", "Kubernetes access denied")
            );
        });
    });
});
