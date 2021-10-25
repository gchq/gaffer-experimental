import React from "react"
import { mount, ReactWrapper } from "enzyme"
import AddType from "../../../src/components/schema-builder/add-type"

let wrapper: ReactWrapper
const onAddTypeMockCallBack = jest.fn()
beforeEach(() => {
  wrapper = mount(<AddType onAddType={onAddTypeMockCallBack} />)
})
afterEach(() => {
  wrapper.unmount()
})

describe("Add Type UI Component", () => {
  describe("Add Type inputs", () => {
    it("should have a Type Name input field", () => {
      const typeNameInputField = wrapper.find("input#type-name-input")

      expect(typeNameInputField.props().name).toBe("Type Name")
    })

    it("should display error message when invalid type name entered", () => {
      wrapper.find("input#type-name-input").simulate("change", {
        target: { value: "type name 1" }
      })

      expect(wrapper.find("p#type-name-input-helper-text").text()).toBe("Type name can only contain letters")
    })

    it("should have a Description input field", () => {
      const descriptionInputField = wrapper.find("input#type-description-input")

      expect(descriptionInputField.props().name).toBe("Type Description")
    })

    it("should display error message when invalid type description entered", () => {
      wrapper.find("input#type-description-input").simulate("change", {
        target: { value: "Type description +" }
      })

      expect(wrapper.find("p#type-description-input-helper-text").text()).toBe("Type description can only contain alpha numeric letters and spaces")
    })
    it("should have a Class input field", () => {
      const classInputField = wrapper.find("input#type-class-input")

      expect(classInputField.props().name).toBe("Type Class")
    })

    it("should display error message when invalid type class entered", () => {
      wrapper.find("input#type-class-input").simulate("change", {
        target: { value: "Type class 1" }
      })

      expect(wrapper.find("p#type-class-input-helper-text").text()).toBe("Type class can only contain letters and .")
    })
  })
  describe("On Add Type", () => {
    it("should callback with a type object when a new type has been added", () => {
      const expectedResult: object = {
        "testName": {
          description: "test description",
          class: "test.class"
        }
      }

      addTypeName("testName")
      addTypeDescription("test description")
      addTypeClass("test.class")
      clickAddType()

      expect(onAddTypeMockCallBack).toHaveBeenLastCalledWith(expectedResult)
    })
  })
  describe("Add Type Button", () => {
    it("should have an add type button", () => {
      const addTypeButton = wrapper.find("button#add-type-button")

      expect(addTypeButton.text()).toBe("Add Type")
    })
  })
})
function addTypeName(name: string) {
  const typeNameInputField = wrapper.find("input#type-name-input")
  typeNameInputField.simulate("change", {
    target: { value: name }
  })
}

function addTypeDescription(description: string) {
  const descriptionInputField = wrapper.find("input#type-description-input")
  descriptionInputField.simulate("change", {
    target: { value: description }
  })
}
function addTypeClass(className: string) {
  const classInputField = wrapper.find("input#type-class-input")
  classInputField.simulate("change", {
    target: { value: className }
  })
}
function clickAddType() {
  const addTypeButton = wrapper.find("button#add-type-button")
  addTypeButton.simulate("click")
}
