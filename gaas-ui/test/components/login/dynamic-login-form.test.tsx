import { mount, ReactWrapper } from "enzyme";
import DynamicLoginForm from "../../../src/components/login/dynamic-login-form";

let component: ReactWrapper;
const onClickSignIn = jest.fn();
beforeEach(
    () =>
        (component = mount(
            <DynamicLoginForm requiredFields={["username", "password"]} onClickSignIn={onClickSignIn} />
        ))
);
afterEach(() => component.unmount());
describe("Dynamic Login Form", () => {
    it("Should display the correct textfield based on the requiredField prop", () => {
        expect(component.find("input#username").length).toBe(1);
        expect(component.find("input#password").length).toBe(1);
    });
    it("should callback with the requiredFields and textFields as a map when submit is clicked", () => {
        const expectedMap = new Map<string, string>();
        expectedMap.set("username", "aTestUsername");
        expectedMap.set("password", "aTestPassword");
        component.find("input#username").simulate("change", {
            target: { value: "aTestUsername" },
        });
        component.find("input#password").simulate("change", {
            target: { value: "aTestPassword" },
        });
        component.find("button#submit-sign-in-button").simulate("click");
        expect(onClickSignIn).toHaveBeenCalledTimes(1);
        expect(onClickSignIn).toHaveBeenCalledWith(expectedMap);
    });
});
