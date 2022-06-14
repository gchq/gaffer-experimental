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
import React from "react";
import GraphLifetimeInDaysSelect from "../../../src/components/create-graph/graph-lifetime-in-days-select";

let component: ReactWrapper;
const onChangeMockCallBack = jest.fn();
afterEach(() => {
    component.unmount();
    jest.resetAllMocks();
});
describe("Graph lifetime in days select component", () => {
    describe("General", () => {
        beforeEach(() => {
            component = mount(
                <GraphLifetimeInDaysSelect value={""} onChangeGraphLifetimeInDays={onChangeMockCallBack} />
            );
        });
        it("Should have the correct value in the value props", () => {
            expect(component.find("div#graph-lifetime-in-days-formcontrol").find("input").props().value).toBe("");
        });
        it("should allow a graph lifetime in days to be selected", () => {
            selectGraphLifeTime("10");
            expect(onChangeMockCallBack).toHaveBeenCalledWith("10");
        });
        it("Should not display helper text when graph lifetime in days is not empty", () => {
            expect(component.find("p#graphlifetimeindays-form-helper").text()).toBe("");
        });
    });
});

function selectGraphLifeTime(graphLifetimeInDays: string) {
    component
        .find("div#graph-lifetime-in-days-formcontrol")
        .find("input")
        .simulate("change", {
            target: { value: graphLifetimeInDays },
        });
}
