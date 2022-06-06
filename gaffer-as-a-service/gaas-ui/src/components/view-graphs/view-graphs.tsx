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
import React from "react";
import { Box, CardContent, Container, Grid, Paper, Toolbar, Typography } from "@material-ui/core";
import { Graph } from "../../domain/graph";
import { GetAllGraphsRepo } from "../../rest/repositories/get-all-graphs-repo";
import { DeleteGraphRepo } from "../../rest/repositories/delete-graph-repo";
import { GetStoreTypesRepo } from "../../rest/repositories/get-store-types-repo";
import { AlertType, NotificationAlert } from "../alerts/notification-alert";
import { Copyright } from "../copyright/copyright";
import Gauge from "./gauge";
import { ViewGraphsTable } from "./view-graphs-table";
import { GaaSAPIErrorResponse } from "../../rest/http-message-interfaces/error-response-interface";
import { AddCollaboratorRepo } from "../../rest/repositories/add-collaborator-repo";

interface IState {
    graphs: Graph[];
    errorMessage: string;
    federatedStores: Array<string>;
    otherStores: Array<string>;
}

export default class ViewGraph extends React.Component<{}, IState> {
    constructor(props: Object) {
        super(props);
        this.state = {
            graphs: [],
            errorMessage: "",
            federatedStores: [],
            otherStores: [],
        };
    }

    public async componentDidMount() {
        await this.getGraphs();
        await this.getAllStoreTypes();
    }

    private async getAllStoreTypes() {
        try {
            const allStoreTypes = await new GetStoreTypesRepo().get();
            this.setState({ federatedStores: allStoreTypes.federatedStoreTypes });
            this.setState({ otherStores: allStoreTypes.storeTypes });
        } catch (e) {
            this.setState({
                errorMessage: `Failed to get federated store types. ${(e as GaaSAPIErrorResponse).title}: ${
                    (e as GaaSAPIErrorResponse).detail
                }`,
            });
        }
    }

    private async getGraphs() {
        try {
            const graphs: Graph[] = await new GetAllGraphsRepo().getAll();
            this.setState({ graphs, errorMessage: "" });
        } catch (e) {
            this.setState({
                errorMessage: `Failed to get all graphs. ${(e as GaaSAPIErrorResponse).title}: ${
                    (e as GaaSAPIErrorResponse).detail
                }`,
            });
        }
    }

    private async deleteGraph(graphName: string) {
        try {
            await new DeleteGraphRepo().delete(graphName);
            await this.getGraphs();
        } catch (e) {
            this.setState({
                errorMessage: `Failed to delete graph "${graphName}". ${(e as GaaSAPIErrorResponse).title}: ${
                    (e as GaaSAPIErrorResponse).detail
                }`,
            });
        }
    }

    private async addCollaborator(graphId: string) {
        try {
            await new AddCollaboratorRepo().addCollaborator(graphId);
        } catch (e) {
            this.setState({
                errorMessage: `Failed to add collaborator "${graphId}". ${(e as GaaSAPIErrorResponse).title}: ${
                    (e as GaaSAPIErrorResponse).detail
                }`,
            });
        }
    }

    private convertStoreTypesToGaugeData(): { key: string; data: number }[] {
        const data: { key: string; data: number }[] = [];
        this.state.federatedStores.forEach((storetype: string) => {
            data.push({
                key: storetype.toUpperCase(),
                data: this.state.graphs.filter((graph) => graph.getConfigName() === storetype).length,
            });
        });
        this.state.otherStores.forEach((storetype: string) => {
            data.push({
                key: storetype.toUpperCase(),
                data: this.state.graphs.filter((graph) => graph.getConfigName() === storetype).length,
            });
        });
        return data.filter((item) => item.data !== 0);
    }

    public render() {
        const { graphs, errorMessage } = this.state;

        return (
            <main aria-label={"view-graphs-page"}>
                {errorMessage && <NotificationAlert alertType={AlertType.FAILED} message={errorMessage} />}
                <Toolbar />
                <Container maxWidth="md">
                    <Box my={2}>
                        <Typography
                            variant="h4"
                            align={"center"}
                            id={"view-graphs-title"}
                            aria-label={"view-graphs-title"}
                        >
                            View Graphs
                        </Typography>
                    </Box>
                    <Grid container spacing={3}>
                        <Grid item xs={6} justify="center" alignItems="center">
                            <Paper>
                                <CardContent>
                                    <Typography gutterBottom variant="h6" component="h2">
                                        Summary
                                    </Typography>
                                    <Gauge
                                        maxValue={graphs.length}
                                        data={[
                                            { key: "TOTAL", data: graphs.length },
                                            {
                                                key: "UP",
                                                data: graphs.filter((graph) => graph.getStatus() === "UP").length,
                                            },
                                            {
                                                key: "DOWN",
                                                data: graphs.filter((graph) => graph.getStatus() === "DOWN").length,
                                            },
                                        ]}
                                        colours={["#fdb81e", "#00ECB1", "#F50057"]}
                                    />
                                </CardContent>
                            </Paper>
                        </Grid>

                        <Grid item xs={6}>
                            <Paper>
                                <CardContent>
                                    <Typography gutterBottom variant="h6" component="h2">
                                        Store Types
                                    </Typography>
                                    <Gauge
                                        maxValue={graphs.length}
                                        data={this.convertStoreTypesToGaugeData()}
                                        colours={["#02bfe7", "#02bfe7", "#02bfe7"]}
                                    />
                                </CardContent>
                            </Paper>
                        </Grid>
                    </Grid>
                    <ViewGraphsTable
                        graphs={this.state.graphs}
                        federatedStores={this.state.federatedStores}
                        deleteGraph={(graphName) => this.deleteGraph(graphName)}
                        addCollaborator={(graphId) => this.addCollaborator(graphId)}
                        refreshTable={async () => await this.getGraphs()}
                    />
                    <Box pt={4}>
                        <Copyright />
                    </Box>
                </Container>
            </main>
        );
    }
}
