/*
 * Copyright 2022 Crown Copyright
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

import { mount } from "enzyme";
import React from "react";
import UserGuide from "../../../src/components/user-guide/user-guide";

const wrapper = mount(<UserGuide />);

describe("When UserGuide mounts", () => {
    it("should render the Gaffer Documentation button with correct href link attached", () => {
        const button = wrapper.find("a#gaffer-documentation-button");

        expect(button.text()).toBe("Gaffer Documentation");
        expect(button.props().href).toBe("https://gchq.github.io/gaffer-doc/summaries/getting-started.html");
    });
    it("should display example Elements Schema correctly", () => {
        expect(wrapper.find("div#example-elements-schema").text()).toContain('{"edges":{"RoadUse":{');
    });
    it("should display example Types Schema correctly", () => {
        expect(wrapper.find("div#example-types-schema").text()).toContain('{"types":{"junction":{');
    });
});
