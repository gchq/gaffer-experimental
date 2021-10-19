import {mount, ReactWrapper} from "enzyme";
import AddEdge from "../../../src/components/schema-builder/add-edge";

let wrapper: ReactWrapper;
beforeEach(() => {
    wrapper = mount(<AddEdge/>)
});
afterEach(() => {
    wrapper.unmount();
});
describe("Add Edge UI Component", () => {
    describe("Add Edge inputs", () => {
        it("should have an Edge Name input field", () => {
            const edgeNameInputField = wrapper.find("input#edge-name-input");

            expect(edgeNameInputField.props().name).toBe("Edge Name")
        });
        it("should have a Description input field",() => {
            const descriptionInputField = wrapper.find("input#edge-description-input");

            expect(descriptionInputField.props().name).toBe("Edge Description")
        });
        it("should have a Source select",() => {
            const sourceInputField = wrapper.find("div#edge-source-formcontrol");

            expect(sourceInputField.props().name).toBe("Edge Source")
        });
        it("should have a Destination select",() => {
            const destinationInputField = wrapper.find("div#edge-destination-formcontrol");

            expect(destinationInputField.props().name).toBe("Edge Destination")
        });
        it("should have a Directed select",() => {
            const directedSelect = wrapper.find("label#edge-directed-select-label");
            console.log(wrapper.html())
            expect(directedSelect.text()).toBe("Directed")
        });
        //TODO: Properties and Group by
    })
})