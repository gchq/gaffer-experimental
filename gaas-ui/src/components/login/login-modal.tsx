import React from "react";
import { Button, Dialog, DialogContent, DialogTitle, IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import TempPasswordLoginForm from "./temp-password-login-form";
import LoginForm from "./login-form";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { createStyles, withStyles, WithStyles } from "@material-ui/core/styles";
import { AuthClientFactory } from "../../rest/clients/auth-client-factory";
import { IAuthClient } from "../../rest/clients/authclient";
import { Logo } from "../logo";
import LoginOptions from "./login-options";
import { RestClient } from "../../rest/clients/rest-client";
import jwt_decode from "jwt-decode";
import { Config } from "../../rest/config";
import { CognitoIdentityClient } from "../../rest/clients/cognito-identity-client";
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

interface IProps extends WithStyles<typeof styles> {
    onLogin(username: string): void;
}

export enum FormType {
    EXISTING_USER_LOGIN,
    TEMP_PASSWORD_LOGIN,
}

export enum UserStatus {
    SIGNED_IN,
    SIGNED_OUT,
}

interface IState {
    status: UserStatus;
    formType: FormType;
    openSignOutModal: boolean;
    signOutMessage: string;
    requiredFields: Array<string>;
}

class LoginModal extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            status: UserStatus.SIGNED_OUT,
            formType: FormType.EXISTING_USER_LOGIN,
            openSignOutModal: false,
            signOutMessage: "",
            requiredFields: [],
        };
    }

    getQueryStringParams = (query: any) =>
        query
            ? (/^[?#]/.test(query) ? query.slice(1) : query).split("&").reduce((params: any, param: any) => {
                  const [key, value] = param.split("=");
                  params[key] = value ? decodeURIComponent(value.replace(/\+/g, " ")) : "";
                  return params;
              }, {})
            : {};

    public async componentDidMount() {
        const idToken = this.getQueryStringParams(window.location.href.split("#").pop())["id_token"];
        if (idToken) {
            const decode = Object.entries(jwt_decode(idToken));
            const username = decode.filter((entry) => entry[0] === "cognito:username")[0][1] as string;
            RestClient.setJwtToken(idToken);
            this.setState({ status: UserStatus.SIGNED_IN });
            this.props.onLogin(username);
        }
    }

    private readonly authClient: IAuthClient = new AuthClientFactory().create();

    public render() {
        const { classes } = this.props;
        const { formType, status, openSignOutModal, requiredFields } = this.state;

        return (
            <div id="login-modal">
                <Button
                    id="sign-out-button"
                    color="inherit"
                    startIcon={<ExitToAppIcon />}
                    onClick={() => {
                        const onSuccess = () => this.setState({ status: UserStatus.SIGNED_OUT });
                        const onError = (errorMessage: string) => {
                            this.setState({
                                openSignOutModal: true,
                                signOutMessage: errorMessage,
                            });
                        };
                        if (Config.REACT_APP_API_PLATFORM === "AWS") {
                            window.open(CognitoIdentityClient.buildCognitoLogoutURL(), "_self");
                        } else {
                            this.authClient.signOut(onSuccess, onError);
                        }
                    }}
                >
                    Sign out
                </Button>
                <Dialog id="login-modal-dialog" fullScreen open={status === UserStatus.SIGNED_OUT}>
                    <DialogContent style={{ padding: 30 }}>
                        <Logo />
                        {formType === FormType.EXISTING_USER_LOGIN && (
                            <DynamicLoginForm
                                requiredFields={requiredFields}
                                onClickSignIn={(requiredValues: Map<String, String>) => {}}
                            />
                        )}
                        {formType === FormType.EXISTING_USER_LOGIN && Config.REACT_APP_API_PLATFORM === "AWS" && (
                            <LoginOptions cognitoLoginURL={CognitoIdentityClient.buildCognitoLoginURL()} />
                        )}
                        {formType === FormType.TEMP_PASSWORD_LOGIN && (
                            <TempPasswordLoginForm
                                onChangeForm={(formType: FormType) => this.setState({ formType })}
                                onSuccess={(username: string) => {
                                    this.setState({ status: UserStatus.SIGNED_IN });
                                    this.props.onLogin(username);
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>
                <Dialog id="signout-outcome-modal" open={openSignOutModal}>
                    <IconButton
                        id="close-signout-outcome-modal"
                        aria-label="close"
                        className={classes.closeButton}
                        onClick={() => {
                            this.setState({ openSignOutModal: false });
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <DialogTitle id="alert-dialog-title" style={{ padding: 40 }}>
                        {this.state.signOutMessage}
                    </DialogTitle>
                </Dialog>
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(LoginModal);
