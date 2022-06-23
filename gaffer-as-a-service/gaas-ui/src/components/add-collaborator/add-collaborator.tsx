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

import { Box, Button, Container, CssBaseline, Grid, makeStyles, Toolbar, Typography } from "@material-ui/core";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import React, { useState } from "react";
import { AlertType, NotificationAlert } from "../alerts/notification-alert";
import { Copyright } from "../copyright/copyright";
import { GaaSAPIErrorResponse } from "../../rest/http-message-interfaces/error-response-interface";
import DOMPurify from "dompurify";
import { encode } from "html-entities";
import { AddCollaboratorRepo } from "../../rest/repositories/add-collaborator-repo";
import GraphIdUsernameInput from "./graph-id-collaborator";
import { useLocation } from "react-router-dom";

export default function AddCollaborator(props: any) {
    const location: any = useLocation();
    const [graphId, setGraphId] = useState(location.state.graphId);
    const [username, setUsername] = useState("");
    const [usernameIsValid, setUsernameIsValid] = useState(false);
    const [outcome, setOutcome] = React.useState<AlertType | undefined>();
    const [outcomeMessage, setOutcomeMessage] = useState("");

    const submitAddCollaborator = async () => {
        setUsername(username);

        try {
            await new AddCollaboratorRepo().addCollaborator(
                encode(DOMPurify.sanitize(graphId)),
                encode(DOMPurify.sanitize(username))
            );

            setOutcome(AlertType.SUCCESS);
            setOutcomeMessage(`${username} was successfully added as a collaborator to ${graphId}`);

            resetForm();
        } catch (e: any) {
            setOutcome(AlertType.FAILED);
            setOutcomeMessage(
                `Failed to Add '${graphId}' Graph. ${(e as GaaSAPIErrorResponse).title}: ${
                    (e as GaaSAPIErrorResponse).detail
                }`
            );
        }
    };

    const resetForm = () => {
        setUsername("");
    };

    const updateUsername = (username: string, usernameIsValid: boolean) => {
        setUsernameIsValid(usernameIsValid);
        setUsername(username);
    };

    const disableSubmitButton = () => !username || !usernameIsValid;

    const classes: any = makeStyles((theme) => ({
        paper: {
            marginTop: theme.spacing(2),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        },
        avatar: {
            margin: theme.spacing(1),
            backgroundColor: theme.palette.secondary.main,
        },
        form: {
            width: "100%", // Fix IE 11 issue.
            marginTop: theme.spacing(3),
        },
        submit: {
            margin: theme.spacing(3, 0, 2),
        },
        button: {
            margin: "10px",
        },
    }));

    return (
        <main aria-label="add-collaborator-Page" id={"add-collaborator-page"}>
            {outcome && <NotificationAlert alertType={outcome} message={outcomeMessage} />}
            <Toolbar />
            <Toolbar />

            <Grid container justify="center">
                <Container maxWidth="md">
                    <CssBaseline />
                    <div className={classes.paper}>
                        <Grid
                            item
                            xs={12}
                            container
                            direction="row"
                            justify="center"
                            alignItems="center"
                            style={{ margin: 10 }}
                        >
                            <Box my={4}>
                                <Typography
                                    variant="h4"
                                    align={"center"}
                                    id={"add-collaborator-title"}
                                    aria-label={"add-collaborato-title"}
                                >
                                    Add Collaborator
                                </Typography>
                            </Box>
                        </Grid>
                        <form className={classes.form} noValidate>
                            <Grid container spacing={1}>
                                <GraphIdUsernameInput
                                    graphIdValue={DOMPurify.sanitize(graphId)}
                                    usernameValue={username}
                                    onChangeUsername={(username, usernameIsValid) =>
                                        updateUsername(username, usernameIsValid)
                                    }
                                />

                                <Grid item xs={12} container direction="row" justify="flex-end" alignItems="center" />
                            </Grid>
                        </form>
                    </div>
                </Container>
                <Grid container style={{ margin: 10 }} direction="row" justify="center" alignItems="center">
                    <Button
                        id="add-collaborator-button"
                        onClick={() => {
                            submitAddCollaborator();
                        }}
                        startIcon={<AddCircleOutlineOutlinedIcon />}
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        disabled={disableSubmitButton()}
                    >
                        Add Collaborator
                    </Button>
                </Grid>
                <Box pt={4}>
                    <Copyright />
                </Box>
            </Grid>
        </main>
    );
}
