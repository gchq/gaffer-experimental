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
