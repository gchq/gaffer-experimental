import { Button, Grid } from '@material-ui/core';
import React from 'react';
import { Config } from '../../rest/config';

export default function LoginOptions() {
    const url = Config.REACT_APP_AUTH_ENDPOINT;

    return (
        <main id="login-options">
            <Grid container direction="column" justify="center" alignItems="center">
                <Button
                    id="login-with-cognito-button"
                    aria-label="login-with-cognito-button"
                    variant="contained"
                    color="primary"
                    style={{ marginTop: '20px' }}
                    href={url}
                >
                    Login with Cognito
                </Button>
            </Grid>
        </main>
    );
}
