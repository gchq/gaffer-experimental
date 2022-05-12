import { Button, Grid } from "@material-ui/core";
import React from "react";

const sanitizeUrl = require("@braintree/sanitize-url").sanitizeUrl;

interface IProps {
    cognitoLoginURL: string;
}
function LoginOptions(props: IProps) {
    const { cognitoLoginURL } = props;
    const sanitizer = (url: string): string => {
        const regex = new RegExp("[^-A-Za-z0-9+&@#/%?=~_|!:,.;()]");
        if (regex.test(url)) {
            return "";
        }
        return sanitizeUrl(url);
    };
    return (
        <main id="login-options">
            <Grid container direction="column" justify="center" alignItems="center">
                <Button // nosemgrep
                    id="login-with-cognito-button"
                    aria-label="login-with-cognito-button"
                    variant="contained"
                    color="primary"
                    style={{ marginTop: "20px" }}
                    href={sanitizer(cognitoLoginURL)} // nosemgrep
                >
                    Login with Cognito
                </Button>
            </Grid>
        </main>
    );
}
