/*
 * Copyright 2021-2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */

import { mount, ReactWrapper } from "enzyme";
import React from "react";
import StoreTypeSelect from "../../../src/components/create-graph/storetype-select";

jest.mock("../../../src/rest/repositories/get-store-types-repo");
let component: ReactWrapper;
const onChangeMockCallBack = jest.fn();
afterEach(() => {
    component.unmount();
    jest.resetAllMocks();
});
describe("Storetype select component", () => {
    describe("General", () => {
        beforeEach(() => {
            component = mount(
                <StoreTypeSelect
                    value={""}
                    allStoreTypes={["accumulo", "mapStore", "proxy", "proxyNoContextRoot", "federated"]}
                    onChangeStoreType={onChangeMockCallBack}
                />
            );
        });
        it("Should have the correct value in the value props", () => {
            expect(component.find("div#storetype-formcontrol").find("input").props().value).toBe("");
        });
        it("should allow a storetype to be selected", () => {
            selectStoreType("accumulo");
            expect(onChangeMockCallBack).toHaveBeenCalledWith("accumulo");
        });
        it("Should not display helper text when storetype is not empty", () => {
            expect(component.find("p#storetype-form-helper").text()).toBe("");
        });
    });
    describe("Helper Text", () => {
        beforeEach(() => {
            component = mount(
                <StoreTypeSelect value={""} allStoreTypes={[]} onChangeStoreType={onChangeMockCallBack} />
            );
        });
        it("Should display helper text when storetype empty", () => {
            expect(component.find("p#storetype-form-helper").text()).toBe("No storetypes available");
        });
    });
});
function selectStoreType(storeType: string) {
    component
        .find("div#storetype-formcontrol")
        .find("input")
        .simulate("change", {
            target: { value: storeType },
        });
}
