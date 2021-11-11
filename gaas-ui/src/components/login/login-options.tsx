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
                    href={
                        url +
                        '/login' +
                        '?client_id=' +
                        Config.REACT_APP_COGNITO_CLIENTID +
                        '&response_type=token' +
                        '&scope=aws.cognito.signin.user.admin+email+openid+phone+profile+gaas-rest-resource/graphs' +
                        '&redirect_uri=http://localhost:3000/viewgraphs'
                    }
                >
                    Login with Cognito
                </Button>
            </Grid>
        </main>
    );
}
