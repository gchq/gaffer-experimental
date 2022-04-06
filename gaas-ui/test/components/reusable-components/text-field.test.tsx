import { mount, ReactWrapper } from "enzyme";
import ReusableTextField from "../../../src/components/reusable-components/reusable-text-field";

let component: ReactWrapper;
const onChangeCallback = jest.fn();
beforeEach(() => (component = mount(<ReusableTextField name={"TextFieldName"} onChange={onChangeCallback} />)));
afterEach(() => component.unmount());
describe("Reusable TextField", () => {
    it("should have the correct name and label from the props passed in", () => {
        expect(component.find("input").props().name).toEqual("TextFieldName");
        expect(component.find("label").text()).toEqual("TextFieldName *");
    });
    it("should callback with the correct value when the input is changed", () => {
        inputInTextfield("test input");
        expect(component.find("input").props().value).toEqual("test input");
        expect(onChangeCallback).toBeCalledTimes(1);
        expect(onChangeCallback).toBeCalledWith("test input");
    });
});
function inputInTextfield(input: string) {
    component.find("input").simulate("change", {
        target: { value: input },
    });
}
