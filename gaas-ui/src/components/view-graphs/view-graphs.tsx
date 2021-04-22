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
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import RefreshOutlinedIcon from "@material-ui/icons/RefreshOutlined";
import React from "react";
import { RadialGauge, RadialGaugeSeries } from "reaviz";
import { Graph } from "../../domain/graph";
import { DeleteGraphRepo } from "../../rest/repositories/delete-graph-repo";
import { GetAllGraphsRepo } from "../../rest/repositories/get-all-graphs-repo";
import { AlertType, NotificationAlert } from "../alerts/notification-alert";
import { Copyright } from "../copyright/copyright";
import { MainGraphTableRow } from "./main-graph-table-row";

interface IState {
    graphs: Graph[];
    selectedRow: any;
    errorMessage: string;
}

export default class ViewGraph extends React.Component<{}, IState> {
    constructor(props: Object) {
        super(props);
        this.state = {
            graphs: [],
            selectedRow: "",
            errorMessage: "",
        };
    }

    public async componentDidMount() {
        this.getGraphs();
    }

    private async getGraphs() {
        try {
            const graphs: Graph[] = await new GetAllGraphsRepo().getAll();
            this.setState({ graphs, errorMessage: "" });
        } catch (e) {
            this.setState({ errorMessage: `Failed to get all graphs. ${e.toString()}` });
        }
    }

    private async deleteGraph(graphName: string) {
        try {
            await new DeleteGraphRepo().delete(graphName);
            await this.getGraphs();
        } catch (e) {
            this.setState({ errorMessage: `Failed to delete graph "${graphName}". ${e.toString()}` });
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
        const { graphs, errorMessage } = this.state;

        return (
            <main>
                {errorMessage && <NotificationAlert alertType={AlertType.FAILED} message={errorMessage} />}
                <Toolbar />
                    {/* <Grid container justify="center"> */}
                    <Container component="main" maxWidth="md">
                        <Grid container spacing={3}>
                            <Grid item xs={12} >
                                <Paper>
                                    <Card>
                                        <CardHeader
                                            title={"Available Gaffers"}
                                            subheader={"Number of graphs with status 'UP'"}
                                            titleTypographyProps={{ align: "center" }}
                                            subheaderTypographyProps={{ align: "center" }}
                                        />
                                        <CardContent >
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", }}>
                                            <RadialGauge
                                                height={175}
                                                width={175}
                                                minValue={0}
                                                maxValue={graphs.length}
                                                data={[{ key: "", data: graphs.filter((graph) => graph.getStatus() === "UP").length }]}
                                                series={
                                                    <RadialGaugeSeries arcWidth={12} />
                                                }
                                            />
                                        </div>
                                        </CardContent>
                                    </Card>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                            <TableContainer component={Paper}>
                                <Table size="medium" className={this.classes.table} aria-label="Graphs Table">
                                    <TableHead>
                                        <TableRow style={{ background: "#F4F2F2" }}>
                                            <TableCell />
                                            <TableCell>Graph ID</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>URL</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {graphs.map((graph: Graph, index) => (
                                            <MainGraphTableRow 
                                                key={graph.getId()} 
                                                index={index} row={graph} 
                                                onClickDelete={(graphId: string) => this.deleteGraph(graphId)} />
                                        ))}
                                    </TableBody>
                                    {graphs.length === 0 && <caption>No Graphs.</caption>}
                                </Table>
                            </TableContainer>
                        
                            <Grid container style={{ margin: 10 }} direction="row" justify="center" alignItems="center">
                                <Button
                                    id="view-graphs-refresh-button"
                                    onClick={async () => await this.getGraphs()}
                                    startIcon={<RefreshOutlinedIcon />}
                                    variant="contained"
                                    color="primary"
                                    className={this.classes.submit}
                                >
                                    Refresh Table
                                </Button>
                            </Grid>
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
  