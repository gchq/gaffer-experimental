/*
 * Copyright 2021-2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { APIError } from "../../../src/rest/APIError";
import { ICreateFederatedGraphRequestBody } from "../../../src/rest/http-message-interfaces/request-interfaces";
import { CreateFederatedGraphRepo } from "../../../src/rest/repositories/create-federated-graph-repo";

const mock = new MockAdapter(axios);
const repo = new CreateFederatedGraphRepo();

describe("Create Graph Repo", () => {
    describe("On Success", () => {
        it("should request an FEDERATED_STORE  graph when FEDERATED_STORE is parameter", async () => {
            const request: ICreateFederatedGraphRequestBody = {
                proxySubGraphs: [{ graphId: "test-graph", host: "test.graph.host", root: "/rest" }],
                graphId: "fed-store",
                description: "a description",
                configName: "federated",
            };
            mock.onPost("/graphs", request).reply(201);

            await expect(
                repo.create("fed-store", "a description", "federated", {
                    proxySubGraphs: [{ graphId: "test-graph", host: "test.graph.host", root: "/rest" }],
                })
            ).resolves.toEqual(undefined);
        });
    });

    describe("Null checks", () => {
        it("Should throw an error when configName is Federated and proxyStores is undefined", async () => {
            const config = {};
            await expect(repo.create("bad-request-graph", "a description", "federated", config)).rejects.toEqual(
                new Error("Proxy Stores is undefined")
            );
        });

        describe("On Error", () => {
            it("should throw APIError 400 message when API no response body", async () => {
                const request: ICreateFederatedGraphRequestBody = {
                    proxySubGraphs: [{ graphId: "test-graph", host: "test.graph.host", root: "/rest" }],
                    graphId: "bad-request-graph",
                    description: "a description",
                    configName: "federated",
                };
                mock.onPost("/graphs", request).reply(400);

                await expect(
                    repo.create("bad-request-graph", "a description", "federated", {
                        proxySubGraphs: [{ graphId: "test-graph", host: "test.graph.host", root: "/rest" }],
                    })
                ).rejects.toEqual(new APIError("Error Code 400", "Bad Request"));
            });

            it("should throw APIError with title and detail from error response body", async () => {
                const request: ICreateFederatedGraphRequestBody = {
                    proxySubGraphs: [{ graphId: "test-graph", host: "test.graph.host", root: "/rest" }],
                    graphId: "forbidden-graph",
                    description: "a description",
                    configName: "federated",
                };
                mock.onPost("/graphs", request).reply(403, { title: "Forbidden", detail: "Kubernetes access denied" });

                await expect(
                    repo.create("forbidden-graph", "a description", "federated", {
                        proxySubGraphs: [{ graphId: "test-graph", host: "test.graph.host", root: "/rest" }],
                    })
                ).rejects.toEqual(new APIError("Forbidden", "Kubernetes access denied"));
            });
        });
    });
});
