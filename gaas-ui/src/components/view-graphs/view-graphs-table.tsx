import React, {useEffect} from "react";
import {Graph} from "../../domain/graph";
import {GetAllGraphIdsRepo} from "../../rest/repositories/gaffer/get-all-graph-ids-repo";
import {
    Button,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Collapse,
    Avatar,
    Chip,
    makeStyles,
    Paper,
    IconButton,
    Tooltip,
    Zoom
} from "@material-ui/core";
import RefreshOutlinedIcon from "@material-ui/icons/RefreshOutlined";
import CheckRoundedIcon from "@material-ui/icons/CheckRounded";
import WarningRoundedIcon from "@material-ui/icons/WarningRounded";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import DeleteOutlineOutlinedIcon from "@material-ui/icons/DeleteOutlineOutlined";

interface IProps {
    graphs: Graph [];
    federatedStores: Array<string>;
    deleteGraph: (graphName: string) => void;
    refreshTable: () => void;
}

interface IGraphRow {
    index: number;
    graph: Graph;
    federatedStores: Array<string>;
    onClickDelete: (graphId: string) => void;
}

const useStyles = makeStyles({
    root: {
        "& > *": {
            borderBottom: "unset",
        },
    },
    table: {
        minWidth: 650,
    },
});
export function ViewGraphsTable(props: IProps) {
    const classes = useStyles();

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <TableContainer component={Paper}>
                    <Table size="medium" className={classes.table} aria-label="Graphs Table">
                        <TableHead>
                            <TableRow style={{background: "#F4F2F2"}}>
                                <TableCell/>
                                <TableCell>Graph ID</TableCell>
                                <TableCell>Store Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>URL</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {props.graphs.map((graph: Graph, index) => (
                                <MainGraphTableRow
                                    key={graph.getId()}
                                    index={index}
                                    graph={graph}
                                    federatedStores={props.federatedStores}
                                    onClickDelete={(graphId: string) => props.deleteGraph(graphId)}/>
                            ))}
                        </TableBody>
                        {props.graphs.length === 0 && <caption>No Graphs.</caption>}
                    </Table>
                </TableContainer>

                <Grid container style={{margin: 10}} direction="row" justify="center" alignItems="center">
                    <Button
                        id="view-graphs-refresh-button"
                        onClick={() => props.refreshTable()}
                        startIcon={<RefreshOutlinedIcon/>}
                        variant="contained"
                        color="primary"
                    >
                        Refresh Table
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
}

function StatusChip(graph: { status: string }) {
    return (graph.status === "UP") ? <Chip icon={<CheckRoundedIcon style={{color: "#ffffff"}}/>} label={graph.status}
                                           style={{color: "#ffffff", backgroundColor: "#5A7C81"}}/> :
        <Chip icon={<WarningRoundedIcon style={{color: "#ffffff"}}/>} label={graph.status}
              style={{color: "#ffffff", backgroundColor: "#EB0052"}}/>;
}

function MainGraphTableRow(props: IGraphRow) {
    const {graph, index, federatedStores, onClickDelete} = props;
    const classes = useStyles();
    const [rowIsExpanded, setRowIsExpanded] = React.useState(false);
    const [allGraphIdsText, setAllGraphIdsText] = React.useState<string>("");

    useEffect(() => {
        if (federatedStores.includes(graph.getStoreType())) {
            getAllGraphIds();
        }
    });

    async function getAllGraphIds() {
        try {
            const allGraphIds: string[] = await new GetAllGraphIdsRepo().get(graph.getUrl());
            setAllGraphIdsText(allGraphIds.length !== 0 ? "Federated Graphs: " + allGraphIds.join(", ") : "No Federated Graphs");
        } catch (e) {
            setAllGraphIdsText(`Federated Graphs: [GetAllGraphIds Operation - ${e}]`);
        }
    }

    return (
        <React.Fragment>
            <TableRow className={classes.root} hover aria-label={"view-graphs-table"}>
                <TableCell aria-label={"expand-row-icon"}>
                    <IconButton id={"expand-row-button-" + index}
                                aria-label={graph.getId() + "-expand-button"} size="small"
                                onClick={() => setRowIsExpanded(!rowIsExpanded)}>
                        {rowIsExpanded ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row" aria-label={"row-id"}>{graph.getId()}</TableCell>
                <TableCell aria-label={"graph-store-type"}><Avatar
                    style={{
                        color: "white",
                        backgroundColor: "#5A7C81"
                    }}> {graph.getStoreType().charAt(0).toUpperCase()}</Avatar></TableCell>
                <TableCell aria-label={"graph-status"}>
                    <StatusChip status={graph.getStatus()}/></TableCell>
                <TableCell aria-label={"graph-url"}><a href={graph.getUrl()} target="_blank"
                                                       rel="noreferrer">{graph.getUrl()}</a></TableCell>
                <TableCell aria-label={"delete-graph"}>
                    <Tooltip TransitionComponent={Zoom} title={`Delete ${graph.getId()}`}>
                        <IconButton
                            id={"view-graphs-delete-button-" + index}
                            aria-label={graph.getId() + "-delete-button"}
                            onClick={async() => onClickDelete(graph.getId())}
                        >
                            <DeleteOutlineOutlinedIcon/>
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                    <Collapse in={rowIsExpanded} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            <Table size="small" aria-label="graph-details">
                                <TableBody>
                                    <TableRow aria-label={"graph-description"}>
                                        <TableCell component="th"
                                                   scope="row">Description: {graph.getDescription()}</TableCell>
                                    </TableRow>
                                    {federatedStores.includes(graph.getStoreType()) &&
                                    <TableRow id={"federated-graph-ids-" + index} aria-label={"federated-graph-ids"}>
                                        <TableCell component="th" scope="row">{allGraphIdsText}</TableCell>
                                    </TableRow>}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

