import { mount, ReactWrapper } from "enzyme"
import React, { Component } from "react"
import SchemaBuilder from "../../../src/components/schema-builder/schema-builder"
import { act } from "react-dom/test-utils"
import { Backdrop } from "@material-ui/core"
import { IType, ITypesSchema } from "../../../src/domain/types-schema"
import { IElementsSchema } from "../../../src/domain/elements-schema"

let wrapper: ReactWrapper
const onCreateSchemaMockCallBack = jest.fn()
beforeEach(() => {
  wrapper = mount(
    <SchemaBuilder
      elementsSchema={{
        edges: {
          TestEdge: {
            description: "test",
            source: "A",
            destination: "B",
            directed: "true"
          }
        },
        entities: {
          TestEntity: {
            description: "test description",
            vertex: "B"
          }
        }
      }}
      onCreateSchema={onCreateSchemaMockCallBack}
      typesSchema={{
        types: {
          name: {
            description: "test description",
            class: "test.class"
          }
        }
      }}
    />
  )
})
afterEach(() => {
  wrapper.unmount()
})
describe("schema-builder UI wrapper", () => {
  describe("Add schema elements buttons", () => {
    it("should have an Add Type button", () => {
      const addTypeButton = wrapper.find("button#add-type-button")
      expect(addTypeButton.text()).toBe("Add Type")
    })
    it("should have an Add Edge button", () => {
      const addEdgeButton = wrapper.find("button#add-edge-button")

      expect(addEdgeButton.text()).toBe("Add Edge")
    })
    it("should have an Add Entity button", () => {
      const addEntityButton = wrapper.find("button#add-entity-button")

      expect(addEntityButton.text()).toBe("Add Entity")
    })
  })
  describe("Types Schema prop", () => {
    //TODO: Test that when a new type is added it is appended to existing types
    xit("should update the json viewer with the added type from the add type dialog", async () => {
      wrapper.find("button#add-type-button").simulate("click")
      await addTypeName("testName")
      await addTypeDescription("testDescription")
      await addTypeClass("testClass")

      await wrapper.update()
      await wrapper.update()
      await wrapper.update()
      await clickAddType()
      await wrapper.update()
      await wrapper.update()
      await wrapper.update()
      await clickCloseAddTypeDialog()
      await wrapper.update()
      await wrapper.update()
      await wrapper.update()

      expect(wrapper.find("div#json-types-schema-viewer").text()).toEqual("")
    })
    it("should display the types schema that is passed in", () => {
      expect(wrapper.find("div#json-types-schema-viewer").text()).toEqual('"types":{"name":{"description":"test description""class":"test.class"}}')
    })
    xit("should display the new type appended to the old types, when a new type is added", () => {})
  })
  describe("Elements Schema Prop", () => {
    it("should display the elements schema that is passed in", () => {
      expect(wrapper.find("div#json-elements-schema-viewer").text()).toEqual('{"edges":{"TestEdge":{"description":"test""source":"A""destination":"B""directed":"true"}}"entities":{"TestEntity":{"description":"test description""vertex":"B"}}}')
    })
  })

  describe("Disbale | Enable Buttons", () => {
    it("should be enabled add type button when schema builder dailog opens", () => {
      expect(wrapper.find("button#add-type-button").props().disabled).toBe(false)
    })

    it("should be disabled when add edge button when Types is empty", () => {
      const component = mount(
        <SchemaBuilder
          elementsSchema={{
            edges: {},
            entities: {}
          }}
          onCreateSchema={onCreateSchemaMockCallBack}
          typesSchema={{
            types: {}
          }}
        />
      )

      //Disable buttons true
      expect(component.find("button#add-edge-button").props().disabled).toBe(true)
      expect(component.find("button#add-entity-button").props().disabled).toBe(true)
      expect(component.find("button#create-schema-button").props().disabled).toBe(true)

      //Disable buttons false

      expect(wrapper.find("button#add-edge-button").props().disabled).toBe(false)
      expect(wrapper.find("button#add-entity-button").props().disabled).toBe(false)
      expect(wrapper.find("button#create-schema-button").props().disabled).toBe(false)
    })
  })
  describe("onCreateSchema Prop", () => {
    it("should callback with a Types Schema and elements schema when the create schema button is clicked", () => {
      const expectedResult: { types: ITypesSchema; elements: IElementsSchema } = {
        types: {
          types: {
            name: {
              description: "test description",
              class: "test.class"
            }
          }
        },
        elements: {
          entities: {
            TestEntity: {
              description: "test description",
              vertex: "B"
            }
          },
          edges: {
            TestEdge: {
              description: "test",
              source: "A",
              destination: "B",
              directed: "true"
            }
          }
        }
      }

      clickCreateSchema()

      expect(onCreateSchemaMockCallBack).toHaveBeenLastCalledWith(expectedResult)
    })
  })
})

async function addTypeName(name: string) {
  await act(async () => {
    const addTypeNameInput = wrapper.find("div#add-type-dialog").find("input").at(0)
    addTypeNameInput.simulate("change", {
      target: { name: "Type Name", value: name }
    })
  })
}

async function addTypeDescription(description: string) {
  await act(async () => {
    const descriptionInputField = wrapper.find("div#add-type-dialog").find("input").at(1)
    descriptionInputField.simulate("change", {
      target: { name: "Type Description", value: description }
    })
  })
}

async function addTypeClass(className: string) {
  await act(async () => {
    const classInputField = wrapper.find("div#add-type-dialog").find("input").at(2)
    classInputField.simulate("change", {
      target: { name: "Type Class", value: className }
    })
  })
}

async function clickAddType() {
  await act(async () => {
    const addTypeButton = wrapper.find("div#add-type-dialog").find("button#add-type-button")
    addTypeButton.simulate("click")
  })
}

async function clickCloseAddTypeDialog() {
  act(() => {
    const closeAddTypeButton = wrapper.find("div#add-type-dialog").find("button#close-add-type-button")
    wrapper.find(Backdrop).simulate("click")
    closeAddTypeButton.simulate("click")
  })
  expect(wrapper.find("div#add-type-dialog").html()).toBe(0)
}

function clickCreateSchema() {
  const createSchemaButton = wrapper.find("button#create-schema-button")
  createSchemaButton.simulate("click")
}
