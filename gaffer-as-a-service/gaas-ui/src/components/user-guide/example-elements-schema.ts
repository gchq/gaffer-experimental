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

export const exampleElementsSchema: object = {
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
        RoadHasJunction: {
            description: "A directed edge from each road to all the junctions on that road.",
            source: "road",
            destination: "junction",
            directed: "true",
        },
        RegionContainsLocation: {
            description: "A directed edge from each region to location.",
            source: "region",
            destination: "location",
            directed: "true",
        },
        LocationContainsRoad: {
            description: "A directed edge from each location to road.",
            source: "location",
            destination: "road",
            directed: "true",
        },
        JunctionLocatedAt: {
            description: "A directed edge from each junction to its coordinates",
            source: "junction",
            destination: "coordinates",
            directed: "true",
        },
    },
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
        JunctionUse: {
            description:
                "An entity on the junction vertex representing the counts of vehicles moving from junction A to junction B.",
            vertex: "junction",
            properties: {
                startDate: "date.earliest",
                endDate: "date.latest",
                count: "count.long",
                countByVehicleType: "counts.freqmap",
            },
            groupBy: ["startDate", "endDate"],
        },
    },
};
