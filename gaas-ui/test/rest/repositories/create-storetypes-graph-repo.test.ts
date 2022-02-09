import { CreateStoreTypesGraphRepo } from "../../../src/rest/repositories/create-storetypes-graph-repo";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { RestApiError } from "../../../src/rest/RestApiError";
import { ICreateGraphRequestBody } from "../../../src/rest/http-message-interfaces/request-interfaces";
import { ElementsSchema } from "../../../src/domain/elements-schema";
import { TypesSchema } from "../../../src/domain/types-schema";

const mock = new MockAdapter(axios);
const repo = new CreateStoreTypesGraphRepo();
const elements = new ElementsSchema(
    JSON.stringify({
        entities: {
            Cardinality: {
                description: "An entity that is added to every vertex representing the connectivity of the vertex.",
                vertex: "anyVertex",
                properties: {
                    edgeGroup: "set",
                    hllp: "hllp",
                    count: "count.long",
                },
                groupBy: ["edgeGroup"],
            },
        },
        edges: {
            RoadUse: {
                description: "A directed edge representing vehicles moving from junction A to junction B.",
                source: "junction",
                destination: "junction",
                directed: "true",
                properties: {
                    startDate: "date.earliest",
                    endDate: "date.latest",
                    count: "count.long",
                    countByVehicleType: "counts.freqmap",
                },
                groupBy: ["startDate", "endDate"],
            },
        },
    })
);
const types = new TypesSchema(JSON.stringify({ types: {} }));
beforeAll(() => {
    elements.validate();
});
describe("Create Graph Repo", () => {
    describe("On Success", () => {
        it("should request an ACCUMULO store graph when ACCUMULO is parameter", async () => {
            const request: ICreateGraphRequestBody = {
                schema: { entities: elements.getEntities(), edges: elements.getEdges(), types: types.getTypes() },
                graphId: "accumulo-graph",
                description: "a description",
                configName: "accumulo",
            };
            mock.onPost("/graphs", request).reply(201);
            await expect(
                repo.create("accumulo-graph", "a description", "accumulo", {
                    schema: { entities: elements.getEntities(), edges: elements.getEdges(), types: types.getTypes() },
                })
            ).resolves.toEqual(undefined);
        });

        it("should request an MAPSTORE  graph when MAPSTORE is parameter", async () => {
            const request: ICreateGraphRequestBody = {
                schema: { entities: elements.getEntities(), edges: elements.getEdges(), types: types.getTypes() },
                graphId: "map-graph",
                description: "a description",
                configName: "mapstore",
            };
            mock.onPost("/graphs", request).reply(201);

            await expect(
                repo.create("map-graph", "a description", "mapstore", {
                    schema: { entities: elements.getEntities(), edges: elements.getEdges(), types: types.getTypes() },
                })
            ).resolves.toEqual(undefined);
        });
    });

    describe("Null checks", () => {
        it("Should throw an error when configName is Mapstore or Accumulo and schema is undefined", async () => {
            const config = {};
            await expect(repo.create("bad-request-graph", "a description", "mapstore", config)).rejects.toEqual(
                new Error("Schema is undefined")
            );
        });
    });

    describe("On Error", () => {
        it("should throw RestApiError 400 message when API no response body", async () => {
            const request: ICreateGraphRequestBody = {
                schema: { entities: elements.getEntities(), edges: elements.getEdges(), types: types.getTypes() },
                graphId: "bad-request-graph",
                description: "a description",
                configName: "mapstore",
            };
            mock.onPost("/graphs", request).reply(400);

            await expect(
                repo.create("bad-request-graph", "a description", "mapstore", {
                    schema: { entities: elements.getEntities(), edges: elements.getEdges(), types: types.getTypes() },
                })
            ).rejects.toEqual(new RestApiError("Error Code 400", "Bad Request"));
        });

        it("should throw RestApiError with title and detail from error response body", async () => {
            const request: ICreateGraphRequestBody = {
                schema: { entities: elements.getEntities(), edges: elements.getEdges(), types: types.getTypes() },
                graphId: "forbidden-graph",
                description: "a description",
                configName: "mapstore",
            };
            mock.onPost("/graphs", request).reply(403, { title: "Forbidden", detail: "Kubernetes access denied" });

            await expect(
                repo.create("forbidden-graph", "a description", "mapstore", {
                    schema: { entities: elements.getEntities(), edges: elements.getEdges(), types: types.getTypes() },
                })
            ).rejects.toEqual(new RestApiError("Forbidden", "Kubernetes access denied"));
        });
    });
});
