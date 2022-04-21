/*
 * Copyright 2021-2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */

import { EntitiesSchema } from "../../../src/domain/elementsSchema/entities-schema";

describe("Entities Schema", () => {
    describe("Entities validation", () => {
        it("should return no error when entities is empty", () => {
            const notifications = new EntitiesSchema("").validate();

            expect(notifications.isEmpty()).toBe(true);
        });
        it("should return invalid JSON notifications when string is not JSON format", () => {
            const invalidJsonString = "invalid: blahJson";

            const notifications = new EntitiesSchema(invalidJsonString).validate();

            expect(notifications.errorMessage()).toBe("Entities is not valid JSON");
        });
        it("should not return any errors if entities have entity objects and description, vertex, props and groupBy", () => {
            const rawSchema = JSON.stringify({
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
            });

            const notifications = new EntitiesSchema(rawSchema).validate();

            expect(notifications.isEmpty()).toBe(true);
        });
        it("should return invalid entities when entities is not type object", () => {
            const rawSchema = JSON.stringify("invalid: blahJson");

            const notifications = new EntitiesSchema(rawSchema).validate();

            expect(notifications.errorMessage()).toBe("Entities is type string and not an object of Entity objects");
        });
        it("should return description is missing error if Entity doesnt have description", () => {
            const rawSchema = JSON.stringify({
                Cardinality: {
                    vertex: "anyVertex",
                    properties: {
                        edgeGroup: "set",
                        hllp: "hllp",
                        count: "count.long",
                    },
                    groupBy: ["edgeGroup"],
                },
            });

            const notifications = new EntitiesSchema(rawSchema).validate();

            expect(notifications.errorMessage()).toBe('Cardinality entity is missing ["description"]');
        });
        it("should return vertex is missing error if Entity doesnt have vertex", () => {
            const rawSchema = JSON.stringify({
                Cardinality: {
                    description: "An entity that is added to every vertex representing the connectivity of the vertex.",
                    properties: {
                        edgeGroup: "set",
                        hllp: "hllp",
                        count: "count.long",
                    },
                    groupBy: ["edgeGroup"],
                },
            });

            const notifications = new EntitiesSchema(rawSchema).validate();

            expect(notifications.errorMessage()).toBe('Cardinality entity is missing ["vertex"]');
        });
        it("should return properties is missing error if Entity doesnt have properties", () => {
            const rawSchema = JSON.stringify({
                Cardinality: {
                    description: "An entity that is added to every vertex representing the connectivity of the vertex.",
                    vertex: "anyVertex",
                    groupBy: ["edgeGroup"],
                },
            });

            const notifications = new EntitiesSchema(rawSchema).validate();

            expect(notifications.errorMessage()).toBe('Cardinality entity is missing ["properties"]');
        });
        it("should return groupBy is missing error if Entity doesnt have groupBy", () => {
            const rawSchema = JSON.stringify({
                Cardinality: {
                    description: "An entity that is added to every vertex representing the connectivity of the vertex.",
                    vertex: "anyVertex",
                    properties: {
                        edgeGroup: "set",
                        hllp: "hllp",
                        count: "count.long",
                    },
                },
            });

            const notifications = new EntitiesSchema(rawSchema).validate();

            expect(notifications.errorMessage()).toBe('Cardinality entity is missing ["groupBy"]');
        });
        it("should all entity values that are missing in error when entity is empty", () => {
            const rawSchema = JSON.stringify({
                NumberOfElements: {},
            });

            const notifications = new EntitiesSchema(rawSchema).validate();

            expect(notifications.errorMessage()).toBe(
                'NumberOfElements entity is missing ["description", "vertex", "properties", "groupBy"]'
            );
        });
    });
});
