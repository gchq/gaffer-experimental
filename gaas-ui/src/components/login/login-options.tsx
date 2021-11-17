import { Button, Grid } from "@material-ui/core";
import React from "react";
import { Config } from "../../rest/config";

const sanitizeUrl = require("@braintree/sanitize-url").sanitizeUrl;

interface IProps {
    cognitoLoginURL: string;
}
export default function LoginOptions(props: IProps) {
    const { cognitoLoginURL } = props;
    const sanitizer = (url: string): string => {
        const regex = new RegExp("[^-A-Za-z0-9+&@#/%?=~_|!:,.;()]");
        if (regex.test(url)) {
            return "";
        }
        return sanitizeUrl(
            Config.REACT_APP_AUTH_ENDPOINT +
                "/login" +
                "?client_id=" +
                Config.REACT_APP_COGNITO_CLIENTID +
                "&response_type=token" +
                "&scope=" +
                Config.REACT_APP_COGNITO_SCOPE +
                "&redirect_uri=" +
                Config.REACT_APP_COGNITO_REDIRECT_URI
        );
    };
    return (
        <main id="login-options">
            <Grid container direction="column" justify="center" alignItems="center">
                <Button
                    id="login-with-cognito-button"
                    aria-label="login-with-cognito-button"
                    variant="contained"
                    color="primary"
                    style={{ marginTop: "20px" }}
                    href={
                        Config.REACT_APP_AUTH_ENDPOINT +
                        "/login" +
                        "?client_id=" +
                        Config.REACT_APP_COGNITO_CLIENTID +
                        "&response_type=token" +
                        "&scope=" +
                        Config.REACT_APP_COGNITO_SCOPE +
                        "&redirect_uri=" +
                        Config.REACT_APP_COGNITO_REDIRECT_URI
                    }
                >
                    Login with Cognito
                </Button>
            </Grid>
        </main>
    );
}
