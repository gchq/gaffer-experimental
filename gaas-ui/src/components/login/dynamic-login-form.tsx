import { Button, Container, createStyles, CssBaseline, Dialog, Typography } from "@material-ui/core";
import React, { useState } from "react";
import ReusableTextField from "../reusable-components/reusable-text-field";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";

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
    const textfieldValues = new Map<string, string>();
    const [submitIsDisabled, setSubmitDisabled] = useState(true);
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
                                textfieldValues.set(field, textFieldInput);
                                if (textFieldInput.length > 0) {
                                    setSubmitDisabled(false);
                                } else {
                                    setSubmitDisabled(true);
                                }
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
                        disabled={submitIsDisabled}
                        onClick={() => {
                            onClickSignIn(textfieldValues);
                        }}
                    >
                        Sign In
                    </Button>
                </div>
            </Container>
        </main>
    );
}
