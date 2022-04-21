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

import { EdgesSchema } from "../../../src/domain/elementsSchema/edges-schema";

describe("Edges schema", () => {
    describe("Edges validation", () => {
        it("should return no error when edges is empty", () => {
            const notifications = new EdgesSchema("").validate();

            expect(notifications.isEmpty()).toBe(true);
        });
        it("should return invalid JSON notifications when string is not JSON format", () => {
            const invalidJsonString = "invalid: blahJson";

            const notifications = new EdgesSchema(invalidJsonString).validate();

            expect(notifications.errorMessage()).toBe("Edges is not valid JSON");
        });
        it("should not return any errors if edges have edges objects and description, source, destination, directed, properties and groupBy", () => {
            const rawSchema = JSON.stringify({
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

            const notifications = new EdgesSchema(rawSchema).validate();

            expect(notifications.isEmpty()).toBe(true);
        });
        it("should return invalid edges when edges is not type object", () => {
            const rawSchema = JSON.stringify("invalid: blahJson");

            const notifications = new EdgesSchema(rawSchema).validate();

            expect(notifications.errorMessage()).toBe("Edges is type string and not an object of Edges objects");
        });
        it("should return description is missing error if Edges doesnt have description", () => {
            const rawSchema = JSON.stringify({
                RoadUse: {
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

            const notifications = new EdgesSchema(rawSchema).validate();

            expect(notifications.errorMessage()).toBe('RoadUse edge is missing ["description"]');
        });
        it("should return source is missing error if Edges doesnt have source", () => {
            const rawSchema = JSON.stringify({
                RoadUse: {
                    description: "A directed edge representing vehicles moving from junction A to junction B.",
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

            const notifications = new EdgesSchema(rawSchema).validate();

            expect(notifications.errorMessage()).toBe('RoadUse edge is missing ["source"]');
        });
        it("should return destination is missing error if Edges doesnt have destination", () => {
            const rawSchema = JSON.stringify({
                RoadUse: {
                    description: "A directed edge representing vehicles moving from junction A to junction B.",
                    source: "junction",
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
            const notifications = new EdgesSchema(rawSchema).validate();

            expect(notifications.errorMessage()).toBe('RoadUse edge is missing ["destination"]');
        });
        it("should return directed is missing error if Edges doesnt have directed", () => {
            const rawSchema = JSON.stringify({
                RoadUse: {
                    description: "A directed edge representing vehicles moving from junction A to junction B.",
                    source: "junction",
                    destination: "junction",
                    properties: {
                        startDate: "date.earliest",
                        endDate: "date.latest",
                        count: "count.long",
                        countByVehicleType: "counts.freqmap",
                    },
                    groupBy: ["startDate", "endDate"],
                },
            });

            const notifications = new EdgesSchema(rawSchema).validate();

            expect(notifications.errorMessage()).toBe('RoadUse edge is missing ["directed"]');
        });
        it("should return all edges values that are missing in error when edges is empty", () => {
            const rawSchema = JSON.stringify({
                NumberOfElements: {},
            });

            const notifications = new EdgesSchema(rawSchema).validate();

            expect(notifications.errorMessage()).toBe(
                'NumberOfElements edge is missing ["description", "source", "destination", "directed"]'
            );
        });
    });
});
