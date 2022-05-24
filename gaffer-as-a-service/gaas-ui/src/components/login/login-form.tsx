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

import React from "react";
import { Button, CssBaseline, Grid, TextField, Link, InputLabel, Box } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import { AlertType, NotificationAlert } from "../alerts/notification-alert";
import { IAuthClient } from "../../rest/clients/authclient";
import { AuthClientFactory } from "../../rest/clients/auth-client-factory";
import { Copyright } from "../copyright/copyright";
import DOMPurify from "dompurify";
import { encode } from "html-entities";

interface IProps {
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
        this.authClient.login(
            encode(DOMPurify.sanitize(username)),
            encode(DOMPurify.sanitize(password)),
            onSuccess,
            onError
        );
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
                                <InputLabel aria-label="username-input-label" required>
                                    Username
                                </InputLabel>
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
                                <InputLabel aria-label="password-input-label" required>
                                    Password
                                </InputLabel>
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
                                <Link id="temp-password-form-link">
                                    Logging in for the first time with a temporary password?
                                </Link>
                            </Typography>
                        </Grid>
                    </div>
                    <Box pt={4}>
                        <Copyright />
                    </Box>
                </Container>
            </main>
        );
    }
}
