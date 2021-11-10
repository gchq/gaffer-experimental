import { Button, Grid } from '@material-ui/core';
import { FormType } from './login-modal';
import { BrowserRouter as Router, Switch, Route, Link, useParams, useLocation } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import React from 'react';
interface IProps {
    onSuccess(token: string): void;
}
export default function LoginOptions(props: IProps) {
    const url =
        'https://kteam-auth-endpoint.auth.eu-west-2.amazoncognito.com/login?client_id=35hmud0udlqfkc4g0ntaur6t8v&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile+gaas-rest-resource/graphs&redirect_uri=http://localhost:3000/viewgraphs';
    const getQueryStringParams = (query: any) =>
        query
            ? (/^[?#]/.test(query) ? query.slice(1) : query).split('&').reduce((params: any, param: any) => {
                  const [key, value] = param.split('=');
                  params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
                  return params;
              }, {})
            : {};
    return (
        <main id="cognito-login">
            <Grid container direction="column" justify="center" alignItems="center">
                <Button
                    id="login-with-cognito-button"
                    aria-label="login-with-cognito-button"
                    variant="contained"
                    color="primary"
                    style={{ marginTop: '20px' }}
                    // href={url}
                    onClick={async () => {
                        const params = getQueryStringParams(window.location.href.split('#').pop());
                        props.onSuccess(params['id_token']);
                    }}
                >
                    {`thing` + window.location.href}
                </Button>
                <Link to={{ pathname: url }} target={'_blank'}>
                    To cognito
                </Link>
            </Grid>
        </main>
    );
}
