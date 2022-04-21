/*
 * Copyright 2022 Crown Copyright
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

import { ElementsSchema } from "../../src/domain/elements-schema";

describe("Elements Validation", () => {
    it("should return Elements schema is empty when elements is empty", () => {
        const notifications = new ElementsSchema("").validate();

        expect(notifications.errorMessage()).toBe("Elements Schema is empty");
    });
    it("should return invalid JSON notifications when string is not JSON format", () => {
        const invalidJsonString = "invalid: blahJson";

        const notifications = new ElementsSchema(invalidJsonString).validate();

        expect(notifications.errorMessage()).toBe("Elements Schema is not valid JSON");
    });
    it("should return no error when Elements doesnt have entities", () => {
        const rawElementsSchema = JSON.stringify({
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
        });

        const notifications = new ElementsSchema(rawElementsSchema).validate();
        expect(notifications.isEmpty()).toBe(true);
    });
    it("should return no error when Elements doesnt have edges", () => {
        const rawElementsSchema = JSON.stringify({
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
        });

        const notifications = new ElementsSchema(rawElementsSchema).validate();

        expect(notifications.isEmpty()).toBe(true);
    });
    it("should return invalid properties notification when invalid properties is in Elements schema", () => {
        const rawSchema = JSON.stringify({
            unknownProperty: {},
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
        });

        const notifications = new ElementsSchema(rawSchema).validate();

        expect(notifications.errorMessage()).toBe('["unknownProperty"] are invalid Elements schema root properties');
    });
    it("should return all invalid properties notification when multi invalid properties is in Elements schema", () => {
        const rawSchema = JSON.stringify({
            unknownProperty: {},
            anotherInvalidProp: {},
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
        });

        const notifications = new ElementsSchema(rawSchema).validate();

        expect(notifications.errorMessage()).toBe(
            '["unknownProperty", "anotherInvalidProp"] are invalid Elements schema root properties'
        );
    });
    it("should allow visibilityProperty on root as valid", () => {
        const rawSchema = JSON.stringify({
            visibilityProperty: {},
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
        });

        const notifications = new ElementsSchema(rawSchema).validate();

        expect(notifications.isEmpty()).toBe(true);
    });
    it("should have no notifications when the entities and edges are valid", () => {
        const rawSchema = JSON.stringify({
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
        });

        const notifications = new ElementsSchema(rawSchema).validate();

        expect(notifications.errorMessage()).toBe("");
    });
    it("should allow getting edges and entities when they are valid", () => {
        const rawSchema = JSON.stringify({
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
        });

        const elementsSchema = new ElementsSchema(rawSchema);
        elementsSchema.validate();

        expect(elementsSchema.getEntities()).toEqual({
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
        expect(elementsSchema.getEdges()).toEqual({
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
        });
    });
});
