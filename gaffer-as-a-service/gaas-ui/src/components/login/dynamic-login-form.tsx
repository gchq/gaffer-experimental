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
import { Button, Container, createStyles, CssBaseline, Typography } from "@material-ui/core";
import React, { useState } from "react";
import ReusableTextField from "../reusable-components/reusable-text-field";

interface IProps {
    requiredFields: Array<string>;
    onClickSignIn(textFieldValues: Map<string, string>): void;
}

function styles(theme: any) {
    return createStyles({
        root: {
            margin: 0,
            padding: theme.spacing(2),
        },
        closeButton: {
            position: "absolute",
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500],
        },
        large: {
            width: theme.spacing(7),
            height: theme.spacing(7),
        },
    });
}

export default function DynamicLoginForm(props: IProps) {
    const { requiredFields, onClickSignIn } = props;
    const [textfieldInputValues, setTextfieldInputValues] = useState(new Map<string, string>());
    const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
    const checkTextFields = (): boolean => {
        for (const field of requiredFields) {
            if (textfieldInputValues.get(field) === "" || !textfieldInputValues.has(field)) {
                return true;
            }
        }
        return false;
    };
    return (
        <main aria-label="login-form" id="login-form">
            <Container maxWidth="xs" aria-label="login-form" id="login-form">
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
                    {requiredFields.map((field: string) => (
                        <ReusableTextField
                            name={field}
                            onChange={(textFieldInput: string) => {
                                setTextfieldInputValues(textfieldInputValues.set(field, textFieldInput));
                                setSubmitButtonDisabled(checkTextFields());
                            }}
                        />
                    ))}
                    <Button
                        fullWidth
                        id="submit-sign-in-button"
                        aria-label="submit-sign-in-button"
                        variant="contained"
                        color="primary"
                        style={{ marginTop: "20px" }}
                        disabled={submitButtonDisabled}
                        onClick={() => {
                            onClickSignIn(textfieldInputValues);
                        }}
                    >
                        Sign In
                    </Button>
                </div>
            </Container>
        </main>
    );
}
