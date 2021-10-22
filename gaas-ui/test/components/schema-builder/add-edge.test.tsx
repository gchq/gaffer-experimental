import { mount, ReactWrapper } from "enzyme"
import AddEdge from "../../../src/components/schema-builder/add-edge"

let wrapper: ReactWrapper
beforeEach(() => {
  wrapper = mount(<AddEdge />)
})
afterEach(() => {
  wrapper.unmount()
})
describe("Add Edge UI Component", () => {
  describe("Add Edge inputs", () => {
    it("should have an Edge Name input field", () => {
      const edgeNameInputField = wrapper.find("input#edge-name-input")

      expect(edgeNameInputField.props().name).toBe("Edge Name")
    })
    it("should display error message when invalid edge name entered", () => {
      wrapper.find("input#edge-name-input").simulate("change", {
        target: { value: "edge name 1" }
      })

      expect(wrapper.find("p#edge-name-input-helper-text").text()).toBe("Edge name can only contain letters")
    })
    it("should have a Description input field", () => {
      const descriptionInputField = wrapper.find("input#edge-description-input")

      expect(descriptionInputField.props().name).toBe("Edge Description")
    })
    it("should display error message when invalid description entered", () => {
      wrapper.find("input#edge-description-input").simulate("change", {
        target: { value: "Edge description +" }
      })

      expect(wrapper.find("p#edge-description-input-helper-text").text()).toBe("Edge description can only contain alpha numeric letters and spaces")
    })
    it("should have a Source select", () => {
      const sourceSelect = wrapper.find("label#edge-source-select-label")

      expect(sourceSelect.text()).toBe("Source *")
    })
    it("should have a Destination select", () => {
      const destinationSelect = wrapper.find("label#edge-destination-select-label")

      expect(destinationSelect.text()).toBe("Destination *")
    })
    it("should have a Directed select", () => {
      const directedSelect = wrapper.find("label#edge-directed-select-label")

      expect(directedSelect.text()).toBe("Directed *")
    })

    //TODO: Properties and Group by
    describe("Add Edge Button", () => {
      it("should have an Add Edge button", () => {
        const addEdgeButton = wrapper.find("button#add-edge-button")

        expect(addEdgeButton.text()).toBe("Add Edge")
      })
    })
  })
})
