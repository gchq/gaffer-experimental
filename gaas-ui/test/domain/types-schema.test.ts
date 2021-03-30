import { TypesSchema } from "../../src/domain/types-schema";

describe("Types Schema Validation", () => {
    it("should return Types Schema is empty when Types is empty", () => {
        const notifications = new TypesSchema("").validate();

        expect(notifications.errorMessage()).toBe("Types Schema is empty");
    });
    it("should return invalid JSON notifications when string is not JSON format", () => {
        const invalidJsonString = "invalid: blahJson";

    const notifications = new TypesSchema(invalidJsonString).validate();

        expect(notifications.errorMessage()).toBe("Types Schema is not valid JSON");
    });
    it("should return Types Schema does not contain types when Types doesnt have types", () => {
        const rawElementsSchema = JSON.stringify({
            junction: {
                description: "A road junction represented by a String.",
                class: "java.lang.String",
            },
        });

    const notifications = new TypesSchema(rawElementsSchema).validate();

    expect(notifications.errorMessage()).toBe(
      'Types Schema does not contain property types, ["junction"] are invalid Types schema root properties'
    );
  });
  it("should return invalid properties notification when invalid properties is in Types schema", () => {
    const rawSchema = JSON.stringify({
      junction: {
        description: "A road junction represented by a String.",
        class: "java.lang.String",
      },
      types: {},
    });
    it("should return invalid properties notification when invalid properties is in Types schema", () => {
        const rawSchema = JSON.stringify({
            junction: {
                description: "A road junction represented by a String.",
                class: "java.lang.String",
            },
            types: {},
        });

    const notifications = new TypesSchema(rawSchema).validate();

    expect(notifications.errorMessage()).toBe(
      '["junction"] are invalid Types schema root properties'
    );
  });
  it("should return all invalid properties notification when multi invalid properties is in Types schema", () => {
    const rawSchema = JSON.stringify({
      road: {
        description: "A road represented by a String.",
        class: "java.lang.String",
      },
      junction: {
        description: "A road junction represented by a String.",
        class: "java.lang.String",
      },
      types: {
        "date.latest": {
          description:
            "A Date that when aggregated together will be the latest date.",
          class: "java.util.Date",
          validateFunctions: [
            {
              class: "uk.gov.gchq.koryphe.impl.predicate.Exists",
            },
          ],
          aggregateFunction: {
            class: "uk.gov.gchq.koryphe.impl.binaryoperator.Max",
          },
        },
      },
    });
    it("should return all invalid properties notification when multi invalid properties is in Types schema", () => {
        const rawSchema = JSON.stringify({
            road: {
                description: "A road represented by a String.",
                class: "java.lang.String",
            },
            junction: {
                description: "A road junction represented by a String.",
                class: "java.lang.String",
            },
            types: {
                "date.latest": {
                    description: "A Date that when aggregated together will be the latest date.",
                    class: "java.util.Date",
                    validateFunctions: [
                        {
                            class: "uk.gov.gchq.koryphe.impl.predicate.Exists",
                        },
                    ],
                    aggregateFunction: {
                        class: "uk.gov.gchq.koryphe.impl.binaryoperator.Max",
                    },
                },
            },
        });

    const notifications = new TypesSchema(rawSchema).validate();

    expect(notifications.errorMessage()).toBe(
      '["road", "junction"] are invalid Types schema root properties'
    );
  });
  it("should return invalid types in Types schema when types is not object", () => {
    const rawSchema = JSON.stringify({
      types: "blah blah blah",
    });
    it("should return invalid types in Types schema when types is not object", () => {
        const rawSchema = JSON.stringify({
            types: "blah blah blah",
        });

    const notifications = new TypesSchema(rawSchema).validate();

        expect(notifications.errorMessage()).toBe("Types is a string and not an object of types objects");
    });
    it("should return an error if a type has a description property and its not a string ", () => {
        const rawSchema = JSON.stringify({
            types: {
                "date.latest": {
                    description: {},
                    class: "java.util.Date",
                    validateFunctions: [
                        {
                            class: "uk.gov.gchq.koryphe.impl.predicate.Exists",
                        },
                    ],
                    aggregateFunction: {
                        class: "uk.gov.gchq.koryphe.impl.binaryoperator.Max",
                    },
                },
            },
        });

    const notifications = new TypesSchema(rawSchema).validate();

        expect(notifications.errorMessage()).toBe(
            "description in date.latest type is a object, it needs to be a string"
        );
    });
    it("should return an error if a type has a class property and its not a string ", () => {
        const rawSchema = JSON.stringify({
            types: {
                "date.latest": {
                    description: "A Date that when aggregated together will be the latest date.",
                    class: {},
                    validateFunctions: [
                        {
                            class: "uk.gov.gchq.koryphe.impl.predicate.Exists",
                        },
                    ],
                    aggregateFunction: {
                        class: "uk.gov.gchq.koryphe.impl.binaryoperator.Max",
                    },
                },
            },
        });

    const notifications = new TypesSchema(rawSchema).validate();

        expect(notifications.errorMessage()).toBe("class in date.latest type is a object, it needs to be a string");
    });
    it("should return an error if a type has a validateFunctions property and its not an array ", () => {
        const rawSchema = JSON.stringify({
            types: {
                "date.latest": {
                    description: "A Date that when aggregated together will be the latest date.",
                    class: "java.util.Date",
                    validateFunctions: "this is a string",
                    aggregateFunction: {
                        class: "uk.gov.gchq.koryphe.impl.binaryoperator.Max",
                    },
                },
            },
        });

    const notifications = new TypesSchema(rawSchema).validate();

        expect(notifications.errorMessage()).toBe(
            "validateFunctions in date.latest type is a string, it needs to be an Array of objects"
        );
    });
    it("should return an error if a type has a validateFunctions,which doesnt have a class property ", () => {
        const rawSchema = JSON.stringify({
            types: {
                "date.latest": {
                    description: "A Date that when aggregated together will be the latest date.",
                    class: "java.util.Date",
                    validateFunctions: [{}],
                    aggregateFunction: {
                        class: "uk.gov.gchq.koryphe.impl.binaryoperator.Max",
                    },
                },
            },
        });

    const notifications = new TypesSchema(rawSchema).validate();

        expect(notifications.errorMessage()).toBe("validateFunctions in date.latest type doesnt have class");
    });
    it("should return an error if a type has a validateFunctions array, and one of the items is not an object ", () => {
        const rawSchema = JSON.stringify({
            types: {
                "date.latest": {
                    description: "A Date that when aggregated together will be the latest date.",
                    class: "java.util.Date",
                    validateFunctions: [
                        {
                            class: "uk.gov.gchq.koryphe.impl.predicate.Exists",
                        },
                        "test",
                    ],
                    aggregateFunction: {
                        class: "uk.gov.gchq.koryphe.impl.binaryoperator.Max",
                    },
                },
            },
        });

    const notifications = new TypesSchema(rawSchema).validate();

        expect(notifications.errorMessage()).toBe(
            "test in validateFunctions in date.latest type is a string. validateFunctions is an array of objects"
        );
    });
    it("should return an error if a type has a validateFunctions array, and class is not a type string ", () => {
        const rawSchema = JSON.stringify({
            types: {
                "date.latest": {
                    description: "A Date that when aggregated together will be the latest date.",
                    class: "java.util.Date",
                    validateFunctions: [
                        {
                            class: {},
                        },
                    ],
                    aggregateFunction: {
                        class: "uk.gov.gchq.koryphe.impl.binaryoperator.Max",
                    },
                },
            },
        });

    const notifications = new TypesSchema(rawSchema).validate();

        expect(notifications.errorMessage()).toBe(
            "class in validateFunctions in date.latest is object. Should be string"
        );
    });
    it("should return an error if a type has a aggregateFunction property and its not an object ", () => {
        const rawSchema = JSON.stringify({
            types: {
                "date.latest": {
                    description: "A Date that when aggregated together will be the latest date.",
                    class: "java.util.Date",
                    validateFunctions: [
                        {
                            class: "uk.gov.gchq.koryphe.impl.predicate.Exists",
                        },
                    ],
                    aggregateFunction: "this is a string",
                },
            },
        });

    const notifications = new TypesSchema(rawSchema).validate();

        expect(notifications.errorMessage()).toBe(
            "aggregateFunction in date.latest type is a string, it needs to be an object"
        );
    });
    it("should return an error if a type has an aggregateFunction property and it doesnt have class ", () => {
        const rawSchema = JSON.stringify({
            types: {
                "date.latest": {
                    description: "A Date that when aggregated together will be the latest date.",
                    class: "java.util.Date",
                    validateFunctions: [
                        {
                            class: "uk.gov.gchq.koryphe.impl.predicate.Exists",
                        },
                    ],
                    aggregateFunction: {},
                },
            },
        });

    const notifications = new TypesSchema(rawSchema).validate();

        expect(notifications.errorMessage()).toBe("aggregateFunction in date.latest type doesnt have class");
    });
    it("should return an error if a type has an aggregateFunction property and class is not type string ", () => {
        const rawSchema = JSON.stringify({
            types: {
                "date.latest": {
                    description: "A Date that when aggregated together will be the latest date.",
                    class: "java.util.Date",
                    validateFunctions: [
                        {
                            class: "uk.gov.gchq.koryphe.impl.predicate.Exists",
                        },
                    ],
                    aggregateFunction: {
                        class: {},
                    },
                },
            },
        });

    const notifications = new TypesSchema(rawSchema).validate();

        expect(notifications.errorMessage()).toBe(
            "class in aggregateFunction in date.latest type is object should be string"
        );
    });
    it("should return an error if a type has a serialiser property and its not an object ", () => {
        const rawSchema = JSON.stringify({
            types: {
                "date.latest": {
                    description: "A Date that when aggregated together will be the latest date.",
                    class: "java.util.Date",
                    validateFunctions: [
                        {
                            class: "uk.gov.gchq.koryphe.impl.predicate.Exists",
                        },
                    ],
                    aggregateFunction: {
                        class: "uk.gov.gchq.koryphe.impl.binaryoperator.Max",
                    },
                    serialiser: "this is a string",
                },
            },
        });

    const notifications = new TypesSchema(rawSchema).validate();

        expect(notifications.errorMessage()).toBe(
            "serialiser in date.latest type is a string, it needs to be an object"
        );
    });
    it("should return an error if a type has a serialiser property doesnt have class ", () => {
        const rawSchema = JSON.stringify({
            types: {
                "date.latest": {
                    description: "A Date that when aggregated together will be the latest date.",
                    class: "java.util.Date",
                    validateFunctions: [
                        {
                            class: "uk.gov.gchq.koryphe.impl.predicate.Exists",
                        },
                    ],
                    aggregateFunction: {
                        class: "uk.gov.gchq.koryphe.impl.binaryoperator.Max",
                    },
                    serialiser: {},
                },
            },
        });

    const notifications = new TypesSchema(rawSchema).validate();

        expect(notifications.errorMessage()).toBe("serialiser in date.latest type doesnt have class");
    });
    it("should return an error if a type has a serialiser property and the class is not a string ", () => {
        const rawSchema = JSON.stringify({
            types: {
                "date.latest": {
                    description: "A Date that when aggregated together will be the latest date.",
                    class: "java.util.Date",
                    validateFunctions: [
                        {
                            class: "uk.gov.gchq.koryphe.impl.predicate.Exists",
                        },
                    ],
                    aggregateFunction: {
                        class: "uk.gov.gchq.koryphe.impl.binaryoperator.Max",
                    },
                    serialiser: {
                        class: {},
                    },
                },
            },
        });

    const notifications = new TypesSchema(rawSchema).validate();

        expect(notifications.errorMessage()).toBe(
            "class in serialiser in date.latest type is a object, should be a string"
        );
    });
    it("should not return any errors if types is correct", () => {
        const rawSchema = JSON.stringify({
            types: {
                "count.long": {
                    description: "A long count that must be greater than or equal to 0.",
                    class: "java.lang.Long",
                    validateFunctions: [
                        {
                            class: "uk.gov.gchq.koryphe.impl.predicate.IsMoreThan",
                            orEqualTo: true,
                            value: {
                                "java.lang.Long": 0,
                            },
                        },
                    ],
                    aggregateFunction: {
                        class: "uk.gov.gchq.koryphe.impl.binaryoperator.Sum",
                    },
                    serialiser: {
                        class:
                            "uk.gov.gchq.gaffer.sketches.clearspring.cardinality.serialisation.HyperLogLogPlusSerialiser",
                    },
                },
            },
        });

    const notifications = new TypesSchema(rawSchema).validate();

    expect(notifications.isEmpty()).toBe(true);
  });
  it("should not return any errors when description, functions and serialiser are undefined", () => {
    const rawSchema = JSON.stringify({
      types: {
        "count.long": {
          class: "java.lang.Long",
        },
      },
    });
    it("should not return any errors when description, functions and serialiser are undefined", () => {
        const rawSchema = JSON.stringify({
            types: {
                "count.long": {
                    class: "java.lang.Long",
                },
            },
        });

    const notifications = new TypesSchema(rawSchema).validate();

    expect(notifications.isEmpty()).toBe(true);
  });
});
