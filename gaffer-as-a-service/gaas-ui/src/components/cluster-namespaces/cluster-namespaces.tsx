/*
 * Copyright 2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */

import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
    Button,
    Container,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Toolbar,
} from "@material-ui/core";
import RefreshOutlinedIcon from "@material-ui/icons/RefreshOutlined";
import { AlertType, NotificationAlert } from "../alerts/notification-alert";
import { GetAllNamespacesRepo } from "../../rest/repositories/get-all-namespaces-repo";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import { Copyright } from "../copyright/copyright";
import { GaaSRestApiErrorResponse } from "../../rest/http-message-interfaces/error-response-interface";

interface IState {
    namespaces: Array<string>;
    selectedRow: any;
    errorMessage: string;
}

export default class ClusterNamespaces extends React.Component<{}, IState> {
    constructor(props: Object) {
        super(props);
        this.state = {
            namespaces: [],
            selectedRow: "",
            errorMessage: "",
        };
    }

    public async componentDidMount() {
        this.getNamespaces();
    }

    private async getNamespaces() {
        try {
            const namespaces: Array<string> = await new GetAllNamespacesRepo().getAll();
            this.setState({ namespaces: namespaces, errorMessage: "" });
        } catch (e) {
            this.setState({
                errorMessage: `Failed to get all namespaces. ${(e as GaaSRestApiErrorResponse).title}: ${
                    (e as GaaSRestApiErrorResponse).detail
                }`,
            });
        }
    }

    private classes: any = makeStyles({
        root: {
            width: "100%",
            marginTop: 40,
        },
        table: {
            minWidth: 650,
        },
    });

    public render() {
        const { namespaces, errorMessage } = this.state;

        return (
            <main aria-label="Cluster-Namespace-Page">
                {errorMessage && <NotificationAlert alertType={AlertType.FAILED} message={errorMessage} />}
                <Toolbar />
                <Container maxWidth="lg">
                    <Grid container spacing={3} justify="center" alignItems="center">
                        <Grid item xs={12}>
                            <TableContainer component={Paper}>
                                <Table size="medium" className={this.classes.table} aria-label="Namespaces Table">
                                    <TableHead>
                                        <TableRow style={{ background: "#F4F2F2" }}>
                                            <TableCell>Namespaces</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {namespaces.map((namespace: string, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell component="th" scope="row">
                                                    {namespace}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    {namespaces.length === 0 && <caption>No Namespaces</caption>}
                                </Table>
                            </TableContainer>
                        </Grid>
                        <Grid item>
                            <Button
                                id="namespaces-refresh-button"
                                startIcon={<RefreshOutlinedIcon />}
                                onClick={async () => await this.getNamespaces()}
                                variant="contained"
                                color="primary"
                                className={this.classes.submit}
                            >
                                Refresh Table
                            </Button>
                        </Grid>
                    </Grid>
                    <Box pt={4}>
                        <Copyright />
                    </Box>
                </Container>
            </main>
        );
    }
}
