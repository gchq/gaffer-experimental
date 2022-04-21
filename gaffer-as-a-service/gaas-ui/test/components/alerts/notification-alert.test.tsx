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

import React from "react";
import { mount } from "enzyme";
import {
    INotificationAlertProps,
    NotificationAlert,
    AlertType,
} from "../../../src/components/alerts/notification-alert";

describe("Notification Alert", () => {
    it("should render sucess message and M-UI icon from props", () => {
        const successProps: INotificationAlertProps = {
            alertType: AlertType.SUCCESS,
            message: "Was a success",
        };

        const component = mount(<NotificationAlert {...successProps} />);

        expect(component.text()).toBe("Was a success");
    });
    it("should render sucess message and M-UI icon from props", () => {
        const failProps: INotificationAlertProps = {
            alertType: AlertType.FAILED,
            message: "Did not work",
        };

        const component = mount(<NotificationAlert {...failProps} />);

        expect(component.text()).toBe("Did not work");
    });
});
