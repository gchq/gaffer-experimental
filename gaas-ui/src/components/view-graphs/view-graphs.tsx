import React from "react";
import {
    Container,
    Grid,
    Toolbar,
    Typography,
    Box,
    CardContent,
    Paper,
} from "@material-ui/core";
import {Graph} from "../../domain/graph";
import {GetAllGraphsRepo} from "../../rest/repositories/get-all-graphs-repo";
import {DeleteGraphRepo} from "../../rest/repositories/delete-graph-repo";
import {GetStoreTypesRepo} from "../../rest/repositories/get-store-types-repo";
import {AlertType, NotificationAlert} from "../alerts/notification-alert";
import {Copyright} from "../copyright/copyright";
import Gauge from "./gauge";
import {ViewGraphsTable} from "./view-graphs-table";

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
            otherStores: []
        };
    }

    public async componentDidMount() {
        await this.getGraphs();
        await this.getAllStoreTypes();
    }

    private async getAllStoreTypes() {
        try {
            const allStoreTypes = await new GetStoreTypesRepo().get();
            this.setState({federatedStores: allStoreTypes.federatedStoreTypes});
            this.setState({otherStores: allStoreTypes.storeTypes})
        } catch (e) {
            this.setState({errorMessage: `Failed to get federated store types. ${e.toString()}`});
        }
    }

    private async getGraphs() {
        try {
            const graphs: Graph[] = await new GetAllGraphsRepo().getAll();
            this.setState({graphs, errorMessage: ""});
        } catch (e) {
            this.setState({errorMessage: `Failed to get all graphs. ${e.toString()}`});
        }
    }

    private async deleteGraph(graphName: string) {
        try {
            await new DeleteGraphRepo().delete(graphName);
            await this.getGraphs();
        } catch (e) {
            this.setState({errorMessage: `Failed to delete graph "${graphName}". ${e.toString()}`});
        }
    }

    private convertStoreTypesToGaugeData(): { key: string, data: number}[] {
        const data: { key: string; data: number; }[] =[];
        this.state.federatedStores.forEach((storetype: string) => {
            data.push(
                {
                    key: storetype.toUpperCase(),
                    data: this.state.graphs.filter((graph) => graph.getConfigName() === storetype).length
                }
            )
        })
        this.state.otherStores.forEach((storetype: string) => {
            data.push(
                {
                    key: storetype.toUpperCase(),
                    data: this.state.graphs.filter((graph) => graph.getConfigName() === storetype).length
                }
            )
        })
        return data.filter((item) => item.data !== 0);
    }

    public render() {
        const {graphs, errorMessage} = this.state;

        return (
            <main aria-label={"view-graphs-page"}>
                {errorMessage && <NotificationAlert alertType={AlertType.FAILED} message={errorMessage}/>}
                <Toolbar/>
                <Container maxWidth="md">
                    <Box my={2}>
                        <Typography variant="h4" align={"center"} id={"view-graphs-title"}
                                    aria-label={"view-graphs-title"}>
                            View Graphs
                        </Typography>
                    </Box>
                    <Grid container spacing={3}>

                        <Grid item xs={6} justify="center"
                              alignItems="center">
                            <Paper>
                                <CardContent>
                                    <Typography gutterBottom variant="h6" component="h2">
                                        Summary
                                    </Typography>
                                    <Gauge
                                        maxValue={graphs.length}
                                        data={[
                                            {key: "TOTAL", data: graphs.length},
                                            {
                                                key: "UP",
                                                data: graphs.filter((graph) => graph.getStatus() === "UP").length
                                            },
                                            {
                                                key: "DOWN",
                                                data: graphs.filter((graph) => graph.getStatus() === "DOWN").length
                                            },
                                        ]}
                                        colours={[
                                            "#fdb81e",
                                            "#00ECB1",
                                            "#F50057",
                                        ]}
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
                                        colours={[
                                            "#02bfe7",
                                            "#02bfe7",
                                            "#02bfe7",
                                        ]}
                                    />
                                </CardContent>
                            </Paper>
                        </Grid>
                    </Grid>
                    <ViewGraphsTable graphs={this.state.graphs} federatedStores={this.state.federatedStores}
                                     deleteGraph={(graphName) => this.deleteGraph(graphName)}
                                     refreshTable={async() => await this.getGraphs()}/>
                    <Box pt={4}>
                        <Copyright/>
                    </Box>
                </Container>
            </main>
        );
    }
}
