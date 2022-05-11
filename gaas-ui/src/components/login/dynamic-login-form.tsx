import { Button, Container, createStyles, CssBaseline, Typography } from "@material-ui/core";
import React, { useState } from "react";
import ReusableTextField from "../reusable-components/reusable-text-field";

interface IProps {
    requiredFields: Array<string>;
    onClickSignIn(textFieldValues: Map<string, string>): void;
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
