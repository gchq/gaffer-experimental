import React from 'react';
import { Button, CssBaseline, Grid, TextField, Link } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { AlertType, NotificationAlert } from '../alerts/notification-alert';
import { FormType } from './login-modal';
import { IAuthClient } from '../../rest/clients/authclient';
import { AuthClientFactory } from '../../rest/clients/auth-client-factory';

interface IProps {
    onChangeForm(fromType: FormType): void;
    onSuccess(username: string): void;
}

interface IState {
    username: string;
    oldPassword: string;
    newPassword: string;
    outcome: AlertType | undefined;
    outcomeMessage: string;
}

export default class OldPasswordLoginForm extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            username: '',
            oldPassword: '',
            newPassword: '',
            outcome: undefined,
            outcomeMessage: '',
        };
    }

    private readonly authClient: IAuthClient = new AuthClientFactory().create();

    private disableUpdateButton(): boolean {
        const { username, oldPassword, newPassword } = this.state;
        return !username || !oldPassword || !newPassword;
    }

    private resetPassword() {
        const { username, oldPassword, newPassword } = this.state;
        const onSuccess = () => {
            this.props.onSuccess(username);
        };
        const onError = (errorMessage: string) => {
            this.setState({
                outcome: AlertType.FAILED,
                outcomeMessage: `Login failed: ${errorMessage}`,
            });
        };
        this.authClient.setNewPasswordAndLogin(username, oldPassword, newPassword, onSuccess, onError);
    }

    public render() {
        return (
            <main id="old-password-login-form">
                <Container component="main" maxWidth="xs">
                    {this.state.outcome && (
                        <NotificationAlert alertType={this.state.outcome} message={this.state.outcomeMessage} />
                    )}
                    <CssBaseline />
                    <div
                        style={{
                            marginTop: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Typography component="h1" variant="h5">
                            Reset Password & Sign In
                        </Typography>
                        <Grid item>
                            <form
                                style={{
                                    width: '100%',
                                }}
                                noValidate
                            >
                                <TextField
                                    id="username"
                                    variant="outlined"
                                    value={this.state.username}
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Username"
                                    name="username"
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(event) => {
                                        this.setState({
                                            username: event.target.value,
                                        });
                                    }}
                                    onKeyPress={(ev) => {
                                        if (ev.key === 'Enter') {
                                            this.resetPassword();
                                            ev.preventDefault();
                                        }
                                    }}
                                />
                                <TextField
                                    variant="outlined"
                                    value={this.state.oldPassword}
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="old-password"
                                    label="Old Password"
                                    type="password"
                                    id="old-password"
                                    autoComplete="current-password"
                                    onChange={(event) => {
                                        this.setState({
                                            oldPassword: event.target.value,
                                        });
                                    }}
                                    onKeyPress={(ev) => {
                                        if (ev.key === 'Enter') {
                                            this.resetPassword();
                                            ev.preventDefault();
                                        }
                                    }}
                                />
                                <TextField
                                    variant="outlined"
                                    value={this.state.newPassword}
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="new-password"
                                    label="New Password"
                                    type="password"
                                    id="new-password"
                                    autoComplete="current-password"
                                    onChange={(event) => {
                                        this.setState({
                                            newPassword: event.target.value,
                                        });
                                    }}
                                    onKeyPress={(ev) => {
                                        if (ev.key === 'Enter') {
                                            this.resetPassword();
                                            ev.preventDefault();
                                        }
                                    }}
                                />
                                <Button
                                    fullWidth
                                    id="submit-sign-in-button"
                                    variant="contained"
                                    color="primary"
                                    style={{ marginTop: '20px' }}
                                    disabled={this.disableUpdateButton()}
                                    onClick={() => {
                                        this.resetPassword();
                                    }}
                                >
                                    Reset Password And Sign In
                                </Button>
                            </form>
                            <Typography style={{ marginTop: '20px' }}>
                                <Link
                                    id="login-form-link"
                                    onClick={() => this.props.onChangeForm(FormType.EXISTING_USER_LOGIN)}
                                >
                                    Back to sign in
                                </Link>
                            </Typography>
                        </Grid>
                    </div>
                </Container>
            </main>
        );
    }
}
