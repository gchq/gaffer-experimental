import { EntitiesSchema } from "../../src/domain/entities-schema";

describe("Entities Schema", () => {
    describe("Entities validation", () => {
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
