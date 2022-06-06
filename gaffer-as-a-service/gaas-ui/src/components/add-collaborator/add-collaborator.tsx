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

import {
    Box,
    Button,
    Container,
    CssBaseline,
    Grid,
    makeStyles,
    Slide,
    Toolbar,
    Typography,
    Zoom,
} from "@material-ui/core";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import React from "react";
import { AlertType, NotificationAlert } from "../alerts/notification-alert";
import { TransitionProps } from "@material-ui/core/transitions";
import { Copyright } from "../copyright/copyright";
import { GaaSAPIErrorResponse } from "../../rest/http-message-interfaces/error-response-interface";
import DOMPurify from "dompurify";
import { encode } from "html-entities";
import { AddCollaboratorRepo } from "../../rest/repositories/add-collaborator-repo";
import GraphIdCollaboratorInput from "./graph-id-collaborator";

interface IState {
    graphId: string;
    collaborator: string;
    graphIdIsValid: boolean;
    graphCollaboratorIsValid: boolean;
    root: string;
    dialogIsOpen: boolean;
    outcome: AlertType | undefined;
    outcomeMessage: string;
}

const Transition = React.forwardRef((props: TransitionProps & { children?: React.ReactElement<any, any> }) => (
    <Slide direction="up" {...props} />
));

export default class AddCollaborator extends React.Component<{}, IState> {
    constructor(props: object) {
        super(props);
        this.state = {
            graphId: "",
            collaborator: "",
            graphIdIsValid: false,
            graphCollaboratorIsValid: false,
            root: "",
            dialogIsOpen: false,
            outcome: undefined,
            outcomeMessage: "",
        };
    }

    public async componentDidMount() {}

    private async submitAddCollaborator() {
        //TODO: separate functions
        const { graphId } = this.state;

        try {
            await new AddCollaboratorRepo().addCollaborator(encode(DOMPurify.sanitize(graphId)));
            this.setState({
                outcome: AlertType.SUCCESS,
                outcomeMessage: `${graphId} was successfully added collaborator`,
            });
            this.resetForm();
        } catch (e: any) {
            this.setState({
                outcome: AlertType.FAILED,
                outcomeMessage: `Failed to Add '${graphId}' Graph. ${(e as GaaSAPIErrorResponse).title}: ${
                    (e as GaaSAPIErrorResponse).detail
                }`,
            });
        }
    }

    private resetForm() {
        this.setState({
            graphId: "",
            collaborator: "",
        });
    }

    private disableSubmitButton(): boolean {
        const { graphId } = this.state;
        return !graphId;
    }

    public render() {
        return (
            <main aria-label="add-collaborator-Page" id={"add-collaborator-page"}>
                {this.state.outcome && (
                    <NotificationAlert alertType={this.state.outcome} message={this.state.outcomeMessage} />
                )}
                <Toolbar />

                <Grid container justify="center">
                    <Container maxWidth="md">
                        <CssBaseline />
                        <div className={this.classes.paper}>
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
                            <form className={this.classes.form} noValidate>
                                <Grid container spacing={1}>
                                    <GraphIdCollaboratorInput
                                        graphIdValue={this.state.graphId}
                                        onChangeGraphId={(graphId, graphIdIsValid) =>
                                            this.setState({ graphId, graphIdIsValid })
                                        }
                                        collaboratorValue={this.state.collaborator}
                                        onChangeCollaborator={(collaborator, graphCollaboratorIsValid) =>
                                            this.setState({ collaborator, graphCollaboratorIsValid })
                                        }
                                    />

                                    <Grid
                                        item
                                        xs={12}
                                        container
                                        direction="row"
                                        justify="flex-end"
                                        alignItems="center"
                                    />
                                </Grid>
                            </form>
                        </div>
                    </Container>
                    <Grid container style={{ margin: 10 }} direction="row" justify="center" alignItems="center">
                        <Button
                            id="add-collaborator-button"
                            onClick={() => {
                                this.submitAddCollaborator();
                            }}
                            startIcon={<AddCircleOutlineOutlinedIcon />}
                            type="submit"
                            variant="contained"
                            color="primary"
                            className={this.classes.submit}
                            disabled={this.disableSubmitButton()}
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

    private classes: any = makeStyles((theme) => ({
        root: {
            width: "100%",
            marginTop: 40,
        },
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
        previewChip: {
            minWidth: 160,
            maxWidth: 210,
        },
    }));
}
