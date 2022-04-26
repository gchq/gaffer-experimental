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

import { Button, Grid } from "@material-ui/core";
import React from "react";

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
