import { mount, ReactWrapper } from "enzyme";
import { TextField } from "@material-ui/core";

let component: ReactWrapper;
const onChangeCallback = jest.fn();
beforeEach(() => (component = mount(<TextField name={"TextFieldName"} onChange={onChangeCallback} />)));
afterEach(() => component.unmount());
describe("Reusable TextField", () => {
    it("should have the correct name from the props passed in", () => {
        expect(component.find("input").props().name).toEqual("TextFieldName");
    });
    it("should callback with the correct value when the input is changed", () => {
        inputInTextfield("test input");
        console.log(component.html());
        expect(component.find("input").text()).toEqual("test input");
        expect(onChangeCallback).toBeCalledTimes(1);
        expect(onChangeCallback).toBeCalledWith("test input");
    });
});
function inputInTextfield(input: string) {
    component.find("input").simulate("change", {
        target: { value: input },
    });
}
