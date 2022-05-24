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
    it("should sanitize inputs", () => {
        inputInTextfield('<img alt="" src="http://url.to.file.which/not.exist" >');
        expect(component.find("input").props().value).toEqual(
            "&lt;img src=&quot;http://url.to.file.which/not.exist&quot; alt=&quot;&quot;&gt;"
        );
    });
});
function inputInTextfield(input: string) {
    component.find("input").simulate("change", {
        target: { value: input },
    });
}
