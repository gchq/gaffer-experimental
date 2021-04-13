import { mount, ReactWrapper } from "enzyme";
import React from "react";
import AddGraph from "../../../src/components/add-graph/AddGraph";
import { CreateGraphRepo } from "../../../src/rest/repositories/create-graph-repo";
import { RestApiError } from "../../../src/rest/RestApiError";

jest.mock("../../../src/rest/repositories/create-graph-repo");

let wrapper: ReactWrapper;
beforeEach(() => (wrapper = mount(<AddGraph />)));
afterEach(() => wrapper.unmount());

const elements = {
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
        },
        groupBy: ["startDate", "endDate"],
    },
};

const types = {
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
                class: "uk.gov.gchq.gaffer.sketches.clearspring.cardinality.serialisation.HyperLogLogPlusSerialiser",
            },
        },
    },
};

describe("On Render", () => {
    it("should have a Graph Id text field", () => {
        const textfield = wrapper.find("input");
        expect(textfield.at(0).props().name).toBe("graphName");
    });
    it("should have an elements text area", () => {
        const elementsTextfield = wrapper.find("textarea#schema-elements");
        expect(elementsTextfield.props().name).toBe("schema-elements");
    });
    it("should have a types text area", () => {
        const typesTextfield = wrapper.find("textarea#schema-types");
        expect(typesTextfield.props().name).toBe("schema-types");
    });
    it("should have icon button", () => {
        const fileButton = wrapper.find("button").at(0).find("svg");
        expect(fileButton).toHaveLength(1);
    });
    it("should have a Submit button", () => {
        const submitButton = wrapper.find("button").at(3).text();
        expect(submitButton).toBe("Add Graph");
    });
});
describe("Add Graph Button", () => {
    it("should be disabled when Graph Name and Schema fields are empty", () => {
        expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(true);
    });
    it("should be disabled when Graph Name field is empty", () => {
        inputElements(elements);
        inputTypes(types);

        expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(true);
    });
    it("should be disabled when the elements field is empty", () => {
        inputGraphName("G");
        inputElements(elements);

        expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(true);
    });
    it("should be disabled when the types field is empty", () => {
        inputGraphName("G");
        inputTypes(types);

        expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(true);
    });
    it("should be enabled when the Graph Name, Elements and Types is inputted", () => {
        inputGraphName("My Graph");
        inputElements(elements);
        inputTypes(types);

        expect(wrapper.find("button#add-new-graph-button").props().disabled).toBe(false);
    });
});
describe("Dropzone behaviour", () => {
    it("should have an elements drop zone that accepts JSON files", () => {
        const dropZone = wrapper.find("div#elements-drop-zone").find("input");
        expect(dropZone.props().type).toBe("file");
        expect(dropZone.props().accept).toBe("application/json");
    });
    it("should have a types drop zone that accepts JSON files", () => {
        const dropZone = wrapper.find("div#types-drop-zone").find("input");
        expect(dropZone.props().type).toBe("file");
        expect(dropZone.props().accept).toBe("application/json");
    });
    it("should show and hide when AttachFile icon is clicked", () => {
        const component = mount(<AddGraph />);
        expect(component.find("div#dropzone").props().style?.visibility).toBe("hidden");

        clickAttachFile(component);

        expect(component.find("div#dropzone").props().style?.visibility).toBe(undefined);

        clickCloseDropzone(component);

        // TODO: Fix the expection, dropzone should hide
        // expect(component.find('div#dropzone').props()).toBe({});
    });
});
describe("Schema validation integration", () => {
    it("should display validation errors as an Alert Notification", () => {
        inputGraphName("OK Graph");
        inputElements({ blah: "blahhhhh" });
        inputTypes({ blah: "blahhhhh" });

        clickSubmit();

        const expectedMessage =
            "Error(s): Elements Schema does not contain property entities, " +
            "Elements Schema does not contain property edges, " +
            '["blah"] are invalid Elements schema root properties, ' +
            "Types Schema does not contain property types, " +
            '["blah"] are invalid Types schema root properties';
        expect(wrapper.find("div#notification-alert").text()).toBe(expectedMessage);
    });
});
describe("On Submit Request", () => {
    it("should display success message in the NotificationAlert", async () => {
        mockAddGraphRepoWithFunction(() => {});

        inputGraphName("OK Graph");
        inputElements(elements);
        inputTypes(types);

        clickSubmit();
        //@ts-ignore
        await wrapper.update();
        await wrapper.update();

        expect(wrapper.find("div#notification-alert").text()).toBe("OK Graph was successfully added");
    });
    it("should display an error message with server error in the NotificationAlert when Request fails", async () => {
        mockAddGraphRepoWithFunction(() => {
            throw new RestApiError("Validation Error", "Can't have spaces");
        });

        inputGraphName("Break Server");
        inputElements(elements);
        inputTypes(types);

        clickSubmit();

        expect(wrapper.find("div#notification-alert").text()).toBe(
            "Failed to Add 'Break Server' Graph. Validation Error: Can't have spaces"
        );
    });
});

function inputGraphName(graphName: string): void {
    wrapper.find("input#graph-name").simulate("change", {
        target: { value: graphName },
    });
}

function inputElements(elementsObject: object): void {
    wrapper.find("textarea#schema-elements").simulate("change", {
        target: { value: JSON.stringify(elementsObject) },
    });
    expect(wrapper.find("textarea#schema-elements").props().value).toBe(JSON.stringify(elementsObject));
}

function inputTypes(typesObject: object): void {
    wrapper.find("textarea#schema-types").simulate("change", {
        target: { value: JSON.stringify(typesObject) },
    });
    expect(wrapper.find("textarea#schema-types").props().value).toBe(JSON.stringify(typesObject));
}

function clickAttachFile(reactWrapper: ReactWrapper): void {
    reactWrapper.find("button#attach-file-button").simulate("click");
}

function clickCloseDropzone(reactWrapper: ReactWrapper): void {
    reactWrapper.find("button#close-dropzone-button").simulate("click");
}

function clickSubmit(): void {
    wrapper.find("button#add-new-graph-button").simulate("click");
}

function mockAddGraphRepoWithFunction(f: () => void): void {
    // @ts-ignore
    CreateGraphRepo.mockImplementationOnce(() => ({
        create: f,
    }));
}
