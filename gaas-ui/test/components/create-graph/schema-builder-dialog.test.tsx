import {mount, ReactWrapper} from "enzyme";
import SchemaBuilderDialog from "../../../src/components/create-graph/schema-builder-dialog";

let wrapper: ReactWrapper;
beforeEach(() => {
    wrapper = mount(<SchemaBuilderDialog/>);
});
afterEach(() => {
    wrapper.unmount();
});
describe("Schema builder Dialog UI Component", () => {
    describe("Schema builder button", () => {
        it("should have a schema builder button", () => {
            const schemaBuilderButton = wrapper.find("button#schema-builder-button");

            expect(schemaBuilderButton.text()).toBe("Schema Builder");
        })
       //TODO: Dialog open test

    })

})
function clickSchemaBuilderButton() {
    wrapper.find("button#schema-builder-button").simulate("click");
}