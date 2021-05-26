import React from "react";
import { Button, CssBaseline, Grid, TextField, Link, InputLabel } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import { AlertType, NotificationAlert } from "../alerts/notification-alert";
import { FormType } from "./login-modal";
import { IAuthClient } from "../../rest/clients/authclient";
import { AuthClientFactory } from "../../rest/clients/auth-client-factory";

interface IProps {
    onChangeForm(fromType: FormType): void;
    onSuccess(username: string): void;
}

interface IState {
    username: string;
    password: string;
    outcome: AlertType | undefined;
    outcomeMessage: string;
}

export default class LoginForm extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            username: "",
            password: "",
            outcome: undefined,
            outcomeMessage: "",
        };
    }

    private readonly authClient: IAuthClient = new AuthClientFactory().create();

    private disableSignInButton(): boolean {
        const { username, password } = this.state;
        return !username || !password;
    }

    private logIn() {
        const { username, password } = this.state;
        const onSuccess = () => {
            this.props.onSuccess(username);
        };
        const onError = (errorMessage: string) => {
            this.setState({
                outcome: AlertType.FAILED,
                outcomeMessage: `Login failed: ${errorMessage}`,
            });
        };
        this.authClient.login(username, password, onSuccess, onError);
    }

    public render() {
        return (
            <main aria-label="login-form" id="login-form">
                <Container maxWidth="xs">
                    {this.state.outcome && (
                        <NotificationAlert alertType={this.state.outcome} message={this.state.outcomeMessage} />
                    )}
                    <CssBaseline />
                    <div
                        style={{
                            marginTop: "20px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Typography component="h1" variant="h5">
                            Sign in
                        </Typography>
                        <Grid item>
                            <form
                                style={{
                                    width: "100%",
                                }}
                                noValidate
                            >
                                <InputLabel aria-label="username-input-label" required>Username</InputLabel>
                                <TextField
                                    id="username"
                                    variant="outlined"
                                    value={this.state.username}
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="username"
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(event) => {
                                        this.setState({
                                            username: event.target.value,
                                        });
                                    }}
                                    onKeyPress={(ev) => {
                                        if (ev.key === "Enter") {
                                            this.logIn();

                                            ev.preventDefault();
                                        }
                                    }}
                                />
                                <InputLabel aria-label="password-input-label" required>Password</InputLabel>
                                <TextField
                                    variant="outlined"
                                    value={this.state.password}
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    onChange={(event) => {
                                        this.setState({
                                            password: event.target.value,
                                        });
                                    }}
                                    onKeyPress={(ev) => {
                                        if (ev.key === "Enter") {
                                            this.logIn();

                                            ev.preventDefault();
                                        }
                                    }}
                                />
                                <Button
                                    fullWidth
                                    id="submit-sign-in-button"
                                    aria-label="submit-sign-in-button"
                                    variant="contained"
                                    color="primary"
                                    style={{ marginTop: "20px" }}
                                    disabled={this.disableSignInButton()}
                                    onClick={() => {
                                        this.logIn();
                                    }}
                                >
                                    Sign In
                                </Button>
                            </form>
                            <Typography style={{ marginTop: "20px" }}>
                                <Link
                                    id="temp-password-form-link"
                                    onClick={() => this.props.onChangeForm(FormType.TEMP_PASSWORD_LOGIN)}
                                >
                                    Logging in for the first time with a temporary password?
                                </Link>
                            </Typography>
                        </Grid>
                    </div>
                </Container>
            </main>
        );
    }
}
