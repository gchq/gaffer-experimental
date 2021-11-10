import { Button, Grid } from '@material-ui/core';
import { FormType } from './login-modal';
import { BrowserRouter as Router, Switch, Route, Link, useParams } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
interface IProps {
    onSuccess(token: string): void;
}
export default function LoginOptions(props: IProps) {
    const { id_token } = useParams<{ id_token: string }>();
    return (
        <main id="cognito-login">
            <Grid container direction="column" justify="center" alignItems="center">
                <Button
                    id="login-with-cognito-button"
                    aria-label="login-with-cognito-button"
                    variant="contained"
                    color="primary"
                    style={{ marginTop: '20px' }}
                    // href="https://kteam-auth-endpoint.auth.eu-west-2.amazoncognito.com/login?client_id=35hmud0udlqfkc4g0ntaur6t8v&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile+gaas-rest-resource/graphs&redirect_uri=http://localhost:3000/viewgraphs"
                    onClick={async () => {
                        console.log('here');
                        // const token = await axios.get(
                        //     'https://kteam-auth-endpoint.auth.eu-west-2.amazoncognito.com/oauth2/authorize',
                        //     {
                        //         headers: {
                        //             'content-type': 'application/x-www-form-urlencoded',
                        //             client_id: '35hmud0udlqfkc4g0ntaur6t8v',
                        //             redirect_uri: 'http://localhost:3000/viewgraphs',
                        //             response_type: 'token',
                        //             state: 'STATE',
                        //             identity_provider: 'COGNITO',
                        //         },
                        //     }
                        // );
                        props.onSuccess(id_token);
                    }}
                >
                    Login with Cognito
                </Button>
                <Link
                    to={{
                        pathname:
                            'https://kteam-auth-endpoint.auth.eu-west-2.amazoncognito.com/login?client_id=35hmud0udlqfkc4g0ntaur6t8v&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile+gaas-rest-resource/graphs&redirect_uri=http://localhost:3000/viewgraphs',
                    }}
                    target="_blank"
                >
                    Login to Cognito
                </Link>
            </Grid>
        </main>
    );
}
