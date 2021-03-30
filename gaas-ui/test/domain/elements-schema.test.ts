import { ElementsSchema } from "../../src/domain/elements-schema";

describe("Elements Validation", () => {
  it("should return Elements schema is empty when elements is empty", () => {
    const notifications = new ElementsSchema("").validate();

    expect(notifications.errorMessage()).toBe("Elements Schema is empty");
  });
  it("should return invalid JSON notifications when string is not JSON format", () => {
    const invalidJsonString = "invalid: blahJson";

    const notifications = new ElementsSchema(invalidJsonString).validate();

    expect(notifications.errorMessage()).toBe(
      "Elements Schema is not valid JSON"
    );
  });
  it("should return Elements Schema does not contain entities when Elements doesnt have entities", () => {
    const rawElementsSchema = JSON.stringify({
      edges: {
        RoadUse: {
          description:
            "A directed edge representing vehicles moving from junction A to junction B.",
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

    expect(notifications.errorMessage()).toBe(
      "Elements Schema does not contain property entities"
    );
  });
  it("should return Elements Schema does not contain edges when Elements doesnt have edges", () => {
    const rawElementsSchema = JSON.stringify({
      entities: {
        Cardinality: {
          description:
            "An entity that is added to every vertex representing the connectivity of the vertex.",
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

    const notifications = new ElementsSchema(rawSchema).validate();

        expect(notifications.isEmpty()).toBe(true);
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
          description:
            "An entity that is added to every vertex representing the connectivity of the vertex.",
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
          description:
            "A directed edge representing vehicles moving from junction A to junction B.",
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

  describe("Entities validation", () => {
    it("should not return any errors if entities have entity objects and description, vertex, props and groupBy", () => {
      const rawSchema = JSON.stringify({
        entities: {
          Cardinality: {
            description:
              "An entity that is added to every vertex representing the connectivity of the vertex.",
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
            description:
              "A directed edge representing vehicles moving from junction A to junction B.",
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
    it("should return invalid entities in Elements schema when entities is not type object", () => {
      const rawSchema = JSON.stringify({
        entities: "invalid: blahJson",
        edges: {
          RoadUse: {
            description:
              "A directed edge representing vehicles moving from junction A to junction B.",
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
        "Entities is type string and not an object of Entity objects"
      );
    });
    it("should return description is missing error if Entity doesnt have description", () => {
      const rawSchema = JSON.stringify({
        entities: {
          Cardinality: {
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
            description:
              "A directed edge representing vehicles moving from junction A to junction B.",
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
        'Cardinality entity is missing ["description"]'
      );
    });
    it("should return vertex is missing error if Entity doesnt have vertex", () => {
      const rawSchema = JSON.stringify({
        entities: {
          Cardinality: {
            description:
              "An entity that is added to every vertex representing the connectivity of the vertex.",
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
            description:
              "A directed edge representing vehicles moving from junction A to junction B.",
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
        'Cardinality entity is missing ["vertex"]'
      );
    });
    it("should return properties is missing error if Entity doesnt have properties", () => {
      const rawSchema = JSON.stringify({
        entities: {
          Cardinality: {
            description:
              "An entity that is added to every vertex representing the connectivity of the vertex.",
            vertex: "anyVertex",
            groupBy: ["edgeGroup"],
          },
        },
        edges: {
          RoadUse: {
            description:
              "A directed edge representing vehicles moving from junction A to junction B.",
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
        'Cardinality entity is missing ["properties"]'
      );
    });
    it("should return groupBy is missing error if Entity doesnt have groupBy", () => {
      const rawSchema = JSON.stringify({
        entities: {
          Cardinality: {
            description:
              "An entity that is added to every vertex representing the connectivity of the vertex.",
            vertex: "anyVertex",
            properties: {
              edgeGroup: "set",
              hllp: "hllp",
              count: "count.long",
            },
          },
        },
        edges: {
          RoadUse: {
            description:
              "A directed edge representing vehicles moving from junction A to junction B.",
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
        'Cardinality entity is missing ["groupBy"]'
      );
    });
    it("should all entitiy values that are missing in error when entity is empty", () => {
      const rawSchema = JSON.stringify({
        entities: {
          NumberOfElements: {},
        },
        edges: {
          RoadUse: {
            description:
              "A directed edge representing vehicles moving from junction A to junction B.",
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
        'NumberOfElements entity is missing ["description", "vertex", "properties", "groupBy"]'
      );
    });
  });
  describe("Edges validation", () => {
    it("should not return any errors if edges have edges objects and description, source, destination, directed, properties and groupBy", () => {
      const rawSchema = JSON.stringify({
        entities: {
          Cardinality: {
            description:
              "An entity that is added to every vertex representing the connectivity of the vertex.",
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
            description:
              "A directed edge representing vehicles moving from junction A to junction B.",
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
    it("should return invalid edges in Elements schema when edges is not type object", () => {
      const rawSchema = JSON.stringify({
        entities: {
          Cardinality: {
            description:
              "An entity that is added to every vertex representing the connectivity of the vertex.",
            vertex: "anyVertex",
            properties: {
              edgeGroup: "set",
              hllp: "hllp",
              count: "count.long",
            },
            groupBy: ["edgeGroup"],
          },
        },
        edges: "invalid: blahJson",
      });

      const notifications = new ElementsSchema(rawSchema).validate();

      expect(notifications.errorMessage()).toBe(
        "Edges is type string and not an object of Edges objects"
      );
    });
    it("should return description is missing error if Edges doesnt have description", () => {
      const rawSchema = JSON.stringify({
        entities: {
          Cardinality: {
            description:
              "An entity that is added to every vertex representing the connectivity of the vertex.",
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
        'RoadUse edge is missing ["description"]'
      );
    });
    it("should return source is missing error if Edges doesnt have source", () => {
      const rawSchema = JSON.stringify({
        entities: {
          Cardinality: {
            description:
              "An entity that is added to every vertex representing the connectivity of the vertex.",
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
            description:
              "A directed edge representing vehicles moving from junction A to junction B.",
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
        'RoadUse edge is missing ["source"]'
      );
    });
    it("should return destination is missing error if Edges doesnt have destination", () => {
      const rawSchema = JSON.stringify({
        entities: {
          Cardinality: {
            description:
              "An entity that is added to every vertex representing the connectivity of the vertex.",
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
            description:
              "A directed edge representing vehicles moving from junction A to junction B.",
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
        },
      });
      const notifications = new ElementsSchema(rawSchema).validate();

      expect(notifications.errorMessage()).toBe(
        'RoadUse edge is missing ["destination"]'
      );
    });
    it("should return directed is missing error if Edges doesnt have directed", () => {
      const rawSchema = JSON.stringify({
        entities: {
          Cardinality: {
            description:
              "An entity that is added to every vertex representing the connectivity of the vertex.",
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
            description:
              "A directed edge representing vehicles moving from junction A to junction B.",
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
        },
      });

      const notifications = new ElementsSchema(rawSchema).validate();

      expect(notifications.errorMessage()).toBe(
        'RoadUse edge is missing ["directed"]'
      );
    });
    it("should return all edges values that are missing in error when edges is empty", () => {
      const rawSchema = JSON.stringify({
        entities: {
          Cardinality: {
            description:
              "An entity that is added to every vertex representing the connectivity of the vertex.",
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
          NumberOfElements: {},
        },
      });

      const notifications = new ElementsSchema(rawSchema).validate();

      expect(notifications.errorMessage()).toBe(
        'NumberOfElements edge is missing ["description", "source", "destination", "directed"]'
      );
    });
  });
});
