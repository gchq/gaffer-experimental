export const exampleTypesSchema: object = {
    types: {
        junction: {
            description: "A road junction represented by a String.",
            class: "java.lang.String",
        },
        road: {
            description: "A road represented by a String.",
            class: "java.lang.String",
        },
        location: {
            description: "A location represented by a String.",
            class: "java.lang.String",
            validateFunctions: [
                {
                    class: "uk.gov.gchq.koryphe.impl.predicate.Exists",
                },
            ],
        },
        anyVertex: {
            description: "An String vertex - used for cardinalities",
            class: "java.lang.String",
            validateFunctions: [
                {
                    class: "uk.gov.gchq.koryphe.impl.predicate.Exists",
                },
            ],
        },
        coordinates: {
            description: "Coordinates represented by a String in the format 'Eastings,Northings'.",
            class: "java.lang.String",
            validateFunctions: [
                {
                    class: "uk.gov.gchq.koryphe.impl.predicate.Exists",
                },
            ],
        },
        region: {
            description: "A region represented by a String.",
            class: "java.lang.String",
            validateFunctions: [
                {
                    class: "uk.gov.gchq.koryphe.impl.predicate.Exists",
                },
            ],
        },
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
        },
        true: {
            description: "A simple boolean that must always be true.",
            class: "java.lang.Boolean",
            validateFunctions: [
                {
                    class: "uk.gov.gchq.koryphe.impl.predicate.IsTrue",
                },
            ],
        },
        "date.earliest": {
            description: "A Date that when aggregated together will be the earliest date.",
            class: "java.util.Date",
            validateFunctions: [
                {
                    class: "uk.gov.gchq.koryphe.impl.predicate.Exists",
                },
            ],
            aggregateFunction: {
                class: "uk.gov.gchq.koryphe.impl.binaryoperator.Min",
            },
        },
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
        set: {
            class: "java.util.TreeSet",
            aggregateFunction: {
                class: "uk.gov.gchq.koryphe.impl.binaryoperator.CollectionConcat",
            },
        },
        hllp: {
            class: "com.clearspring.analytics.stream.cardinality.HyperLogLogPlus",
            aggregateFunction: {
                class: "uk.gov.gchq.gaffer.sketches.clearspring.cardinality.binaryoperator.HyperLogLogPlusAggregator",
            },
            serialiser: {
                class: "uk.gov.gchq.gaffer.sketches.clearspring.cardinality.serialisation.HyperLogLogPlusSerialiser",
            },
        },
        "counts.freqmap": {
            class: "uk.gov.gchq.gaffer.types.FreqMap",
            validateFunctions: [
                {
                    class: "uk.gov.gchq.koryphe.impl.predicate.Exists",
                },
            ],
            aggregateFunction: {
                class: "uk.gov.gchq.gaffer.types.function.FreqMapAggregator",
            },
        },
    },
};
