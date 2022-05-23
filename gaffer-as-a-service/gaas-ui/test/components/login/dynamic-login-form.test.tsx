/*
 * Copyright 2021-2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
    it("should have a disabled submit button if one or all of the textfields are empty", () => {
        expect(component.find("button#submit-sign-in-button").props().disabled).toBe(true);
        component.find("input#username").simulate("change", {
            target: { value: "aTestUsername" },
        });
        expect(component.find("button#submit-sign-in-button").props().disabled).toBe(true);
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
