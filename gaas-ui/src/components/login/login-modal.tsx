import React, { useState } from "react";
import { Button, Dialog, DialogContent } from "@material-ui/core";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { createStyles } from "@material-ui/core/styles";
import { Logo } from "../logo";
import DynamicLoginForm from "./dynamic-login-form";
import { AuthSidecarClient } from "../../rest/clients/auth-sidecar-client";
import { AlertType, NotificationAlert } from "../alerts/notification-alert";

interface IProps {
    onLogin(isLoggedIn: boolean): void;
    requiredFields: Array<string>;
    showLoginForm: boolean;
}

export default function LoginModal(props: IProps) {
    function postAuth(fields: Map<string, string>) {
        const authSidecarClient: AuthSidecarClient = new AuthSidecarClient();
        try {
            authSidecarClient.postAuth(fields);
            if (AuthSidecarClient.getToken()) {
                setLoginFormIsShown(false);
                onLogin(true);
            }
        } catch (error) {
            setOutcome(AlertType.FAILED);
            setOutcomeMessage(`Login failed: ${error}`);
            onLogin(false);
        }
    }
    const { showLoginForm, requiredFields, onLogin } = props;
    const [loginFormIsShown, setLoginFormIsShown] = useState(showLoginForm);
    const [outcome, setOutcome] = useState<AlertType | undefined>(undefined);
    const [outcomeMessage, setOutcomeMessage] = useState("");
    return (
        <div id="login-modal">
            <Button
                id="sign-out-button"
                color="inherit"
                startIcon={<ExitToAppIcon />}
                onClick={() => {
                    setLoginFormIsShown(true);
                }}
            >
                Sign out
            </Button>
            <Dialog id="login-modal-dialog" fullScreen open={loginFormIsShown}>
                <DialogContent style={{ padding: 30 }}>
                    {outcome && <NotificationAlert alertType={outcome} message={outcomeMessage} />}
                    <Logo />
                    <DynamicLoginForm requiredFields={requiredFields} onClickSignIn={postAuth} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
