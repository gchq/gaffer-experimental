import { Button, Grid } from "@material-ui/core";
import React from "react";

const sanitizeUrl = require("@braintree/sanitize-url").sanitizeUrl;

interface IProps {
    cognitoLoginURL: string;
}
export default function LoginOptions(props: IProps) {
    const { cognitoLoginURL } = props;
    return (
        <main id="login-options">
            <Grid container direction="column" justify="center" alignItems="center">
                <Button
                    id="login-with-cognito-button"
                    aria-label="login-with-cognito-button"
                    variant="contained"
                    color="primary"
                    style={{ marginTop: "20px" }}
                    href={sanitizeUrl(cognitoLoginURL)}
                >
                    Login with Cognito
                </Button>
            </Grid>
        </main>
    );
}
