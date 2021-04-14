import { CreateSimpleGraphRepo } from "../../../src/rest/repositories/create-simple-graph-repo";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { RestApiError } from "../../../src/rest/RestApiError";
import { ICreateSimpleGraphRequestBody } from "../../../src/rest/http-message-interfaces/request-interfaces";
import { StoreType } from "../../../src/domain/store-type";
import { Graph } from "../../../src/domain/graph";
import {ElementsSchema} from "../../../src/domain/elements-schema";
import {TypesSchema} from "../../../src/domain/types-schema";

const mock = new MockAdapter(axios);
const repo = new CreateSimpleGraphRepo();
const elements = new ElementsSchema(JSON.stringify({ entities: {}, edges: {} }));
const types = new TypesSchema(JSON.stringify({ types: {} }));


describe("Create Graph Repo", () => {
    describe("On Success", () => {
        it("should request an ACCUMULO store graph when ACCUMULO is parameter", async () => {
            const request: ICreateSimpleGraphRequestBody = {
                schema: {elements: elements.getElements(), types: types.getTypes()},
                graphId: "accumulo-graph",
                description: "a description",
                storeType: StoreType.ACCUMULO,
                proxyStores: [],
                root: ""
            };
            mock.onPost("/graphs", request).reply(201);

            await expect(repo.create("accumulo-graph", "a description", StoreType.ACCUMULO, [], {elements: elements.getElements(), types: types.getTypes()},"")).resolves.toEqual(
                undefined
            );
        });

        it("should request an MAPSTORE  graph when MAPSTORE is parameter", async () => {
            const request: ICreateSimpleGraphRequestBody = {
                schema: {elements: elements.getElements(), types: types.getTypes()},
                graphId: "map-graph",
                description: "a description",
                storeType: StoreType.MAPSTORE,
                proxyStores: [],
                root: "",
            };
            mock.onPost("/graphs", request).reply(201);

            await expect(repo.create("map-graph", "a description", StoreType.MAPSTORE, [], {elements: elements.getElements(), types: types.getTypes()},"")).resolves.toEqual(
                undefined
            );
        });
        it("should request an FEDERATED_STORE  graph when FEDERATED_STORE is parameter", async () => {
            const request: ICreateSimpleGraphRequestBody = {
                schema: {elements: elements.getElements(), types: types.getTypes()},
                graphId: "fed-store",
                description: "a description",
                storeType: StoreType.FEDERATED_STORE,
                proxyStores: [],
                root: "",
            };
            mock.onPost("/graphs", request).reply(201);

            await expect(repo.create("fed-store", "a description", StoreType.FEDERATED_STORE, [], {elements: elements.getElements(), types: types.getTypes()},"")).resolves.toEqual(
                undefined
            );
        });
        it("should request an FEDERATED_STORE  graph when FEDERATED_STORE is parameter", async () => {
            const request: ICreateSimpleGraphRequestBody = {
                schema: {elements: elements.getElements(), types: types.getTypes()},
                graphId: "fed-store",
                description: "a description",
                storeType: StoreType.FEDERATED_STORE,
                proxyStores: [new Graph("proxy-graph","description","proxy-graph URL", "UP")],
                root: "",
            };
            mock.onPost("/graphs", request).reply(201);

            await expect(repo.create("fed-store", "a description", StoreType.FEDERATED_STORE, [], {elements: elements.getElements(), types: types.getTypes()},"")).resolves.toEqual(
                undefined
            );
        });
    });

    describe("On Error", () => {
        it("should throw RestApiError 400 message when API no response body", async () => {
            const request: ICreateSimpleGraphRequestBody = {
                schema: {elements: elements.getElements(), types: types.getTypes()},
                graphId: "bad-request-graph",
                description: "a description",
                storeType: StoreType.MAPSTORE,
                proxyStores: [],
                root: "",
            };
            mock.onPost("/graphs", request).reply(400);

            await expect(repo.create("bad-request-graph", "a description", StoreType.MAPSTORE,[], {elements: elements.getElements(), types: types.getTypes()},"")).rejects.toEqual(
                new RestApiError("Error Code 400", "Bad Request")
            );
        });

        it("should throw RestApiError with title and detail from error response body", async () => {
            const request: ICreateSimpleGraphRequestBody = {
                schema: {elements: elements.getElements(), types: types.getTypes()},
                graphId: "forbidden-graph",
                description: "a description",
                storeType: StoreType.MAPSTORE,
                proxyStores: [],
                root: "",
            };
            mock.onPost("/graphs", request).reply(403, { title: "Forbidden", detail: "Kubernetes access denied" });

            await expect(repo.create("forbidden-graph", "a description", StoreType.MAPSTORE, [], {elements: elements.getElements(), types: types.getTypes()},"")).rejects.toEqual(
                new RestApiError("Forbidden", "Kubernetes access denied")
            );
        });
    });
});
