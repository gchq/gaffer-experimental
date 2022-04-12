import React, { useState } from "react";
import { Button, Dialog, DialogContent } from "@material-ui/core";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { createStyles } from "@material-ui/core/styles";
import { AuthClientFactory } from "../../rest/clients/auth-client-factory";
import { IAuthClient } from "../../rest/clients/authclient";
import { Logo } from "../logo";
import DynamicLoginForm from "./dynamic-login-form";

function styles(theme: any) {
    return createStyles({
        root: {
            margin: 0,
            padding: theme.spacing(2),
        },
        closeButton: {
            position: "absolute",
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500],
        },
        large: {
            width: theme.spacing(7),
            height: theme.spacing(7),
        },
    });
}

interface IProps {
    onLogin(username: string): void;
    requiredFields: Array<string>;
    showLoginForm: boolean;
}

export default function LoginModal(props: IProps) {
    const getQueryStringParams = (query: any) =>
        query
            ? (/^[?#]/.test(query) ? query.slice(1) : query).split("&").reduce((params: any, param: any) => {
                  const [key, value] = param.split("=");
                  params[key] = value ? decodeURIComponent(value.replace(/\+/g, " ")) : "";
                  return params;
              }, {})
            : {};

    // public async componentDidMount() {
    //     const idToken = this.getQueryStringParams(window.location.href.split("#").pop())["id_token"];
    //     if (idToken) {
    //         const decode = Object.entries(jwt_decode(idToken));
    //         const username = decode.filter((entry) => entry[0] === "cognito:username")[0][1] as string;
    //         RestClient.setJwtToken(idToken);
    //         this.setState({ status: UserStatus.SIGNED_IN });
    //         this.props.onLogin(username);
    //     }
    // }

    const authClient: IAuthClient = new AuthClientFactory().create();

    const { showLoginForm, requiredFields } = props;
    const [loginFormIsShown, setLoginFormIsShown] = useState(showLoginForm);
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
                    <Logo />
                    <DynamicLoginForm
                        requiredFields={requiredFields}
                        onClickSignIn={(requiredValues: Map<String, String>) => {}}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
