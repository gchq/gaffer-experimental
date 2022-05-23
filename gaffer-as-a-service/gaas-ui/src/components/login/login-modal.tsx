import React, { useState } from "react";
import { Button, Dialog, DialogContent } from "@material-ui/core";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { Logo } from "../logo";
import DynamicLoginForm from "./dynamic-login-form";
import { AuthSidecarClient } from "../../rest/clients/auth-sidecar-client";
import { AlertType, NotificationAlert } from "../alerts/notification-alert";

interface IProps {
    onLogin(): void;
    requiredFields: Array<string>;
}

export default function LoginModal(props: IProps) {
    function postAuth(fields: Map<string, string>) {
        const authSidecarClient: AuthSidecarClient = new AuthSidecarClient();
        try {
            authSidecarClient
                .postAuth(fields)
                .then(() => {
                    setLoginFormIsShown(false);
                    onLogin();
                })
                .catch((error) => {
                    throw error;
                });
        } catch (e) {
            setOutcomeMessage(`Login failed: ${e}`);
            setLoginFormIsShown(true);
        }
    }
    const { requiredFields, onLogin } = props;
    const [loginFormIsShown, setLoginFormIsShown] = useState(true);
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
                    {outcomeMessage && <NotificationAlert alertType={AlertType.FAILED} message={outcomeMessage} />}
                    <Logo />
                    <DynamicLoginForm requiredFields={requiredFields} onClickSignIn={postAuth} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
