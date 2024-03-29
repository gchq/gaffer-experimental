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

import React, { useEffect, useState } from "react";
import { Graph } from "../../domain/graph";
import { GetAllGraphIdsRepo } from "../../rest/repositories/gaffer/get-all-graph-ids-repo";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Collapse,
    Grid,
    IconButton,
    makeStyles,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Zoom,
} from "@material-ui/core";
import RefreshOutlinedIcon from "@material-ui/icons/RefreshOutlined";
import CheckRoundedIcon from "@material-ui/icons/CheckRounded";
import WarningRoundedIcon from "@material-ui/icons/WarningRounded";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import DeleteOutlineOutlinedIcon from "@material-ui/icons/DeleteOutlineOutlined";
import PersonAddOutlinedIcon from "@material-ui/icons/PersonAddOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import { sanitizeUrl } from "@braintree/sanitize-url";
import { useNavigate } from "react-router-dom";

interface IProps {
    graphs: Graph[];
    federatedStores: Array<string>;
    deleteGraph: (graphName: string) => void;
    refreshTable: () => void;
    errorMessage: string;
}

interface IGraphRow {
    index: number;
    graph: Graph;
    federatedStores: Array<string>;
    onClickDelete: (graphId: string) => void;
    onClickAddcollaborator: (graphId: string) => void;
    onClickViewGraphCollaborator: (graphId: string) => void;
    onClickDuplicateGraph: (graph: Graph) => void;
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

    const navigate = useNavigate();

    const navigateToAddcollaborator = (graphId: string) => {
        navigate("/addcollaborator", { state: { graphId: graphId } });
    };

    const navigateToViewGraphCollaborator = (graphId: string) => {
        navigate("/viewcollaborators", { state: { graphId: graphId } });
    };

    const navigateToCreateGraph = (graph: Graph) => {
        navigate("/creategraph", { state: { graph: graph } });
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <TableContainer component={Paper}>
                    <Table size="medium" className={classes.table} aria-label="Graphs Table">
                        <TableHead>
                            <TableRow style={{ background: "#F4F2F2" }}>
                                <TableCell />
                                <TableCell>Graph ID</TableCell>
                                <TableCell>Store Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>UI URL</TableCell>
                                <TableCell>REST URL</TableCell>
                                <TableCell>Add Collaborator</TableCell>
                                <TableCell>View Graph Collaborators</TableCell>
                                <TableCell>Graph Auto Destroy Date</TableCell>
                                <TableCell>Duplicate Graph</TableCell>
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
                                    onClickAddcollaborator={(graphId: string) => navigateToAddcollaborator(graphId)}
                                    onClickViewGraphCollaborator={(graphId: string) =>
                                        navigateToViewGraphCollaborator(graphId)
                                    }
                                    onClickDuplicateGraph={(graph: Graph) => navigateToCreateGraph(graph)}
                                    onClickDelete={(graphId: string) => props.deleteGraph(graphId)}
                                />
                            ))}
                        </TableBody>
                        {props.graphs.length === 0 && <caption>No Graphs.</caption>}
                    </Table>
                </TableContainer>

                <Grid container style={{ margin: 10 }} direction="row" justify="center" alignItems="center">
                    <Button
                        id="view-graphs-refresh-button"
                        onClick={() => props.refreshTable()}
                        startIcon={<RefreshOutlinedIcon />}
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
    return graph.status === "UP" ? (
        <Chip
            icon={<CheckRoundedIcon style={{ color: "#ffffff" }} />}
            label={graph.status}
            style={{ color: "#ffffff", backgroundColor: "#5A7C81" }}
        />
    ) : (
        <Chip
            icon={<WarningRoundedIcon style={{ color: "#ffffff" }} />}
            label={graph.status}
            style={{ color: "#ffffff", backgroundColor: "#EB0052" }}
        />
    );
}

function MainGraphTableRow(props: IGraphRow) {
    const {
        graph,
        index,
        federatedStores,
        onClickDelete,
        onClickAddcollaborator,
        onClickViewGraphCollaborator,
        onClickDuplicateGraph,
    } = props;
    const classes = useStyles();
    const [rowIsExpanded, setRowIsExpanded] = React.useState(false);
    const [allGraphIdsText, setAllGraphIdsText] = React.useState<string>("");

    useEffect(() => {
        setGraphUrl();
        if (federatedStores.includes(graph.getConfigName())) {
            getAllGraphIds();
        }
    });

    async function getAllGraphIds() {
        try {
            const allGraphIds: string[] = await new GetAllGraphIdsRepo().get(graph.getRestUrl());
            setAllGraphIdsText(
                allGraphIds.length !== 0 ? "Federated Graphs: " + allGraphIds.join(", ") : "No Federated Graphs"
            );
        } catch (e) {
            setAllGraphIdsText(`Federated Graphs: [GetAllGraphIds Operation - ${e}]`);
        }
    }
    function setGraphUrl() {
        const tableCellLinkElement = document.getElementById(graph.getId());
        if (tableCellLinkElement !== null) {
            tableCellLinkElement.setAttribute("href", graph.getUrl());
        }
    }
    const sanitizer = (url: string): string => {
        const regex = new RegExp("[^-A-Za-z0-9+&@#/%?=~_|!:,.;()]");
        if (regex.test(url)) {
            return "";
        }
        return sanitizeUrl(url);
    };

    return (
        <React.Fragment>
            <TableRow className={classes.root} hover aria-label={"view-graphs-table"}>
                <TableCell aria-label={"expand-row-icon"}>
                    <IconButton
                        id={"expand-row-button-" + index}
                        aria-label={graph.getId() + "-expand-button"}
                        size="small"
                        onClick={() => setRowIsExpanded(!rowIsExpanded)}
                    >
                        {rowIsExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row" aria-label={"row-id"}>
                    {graph.getId()}
                </TableCell>
                <TableCell aria-label={"graph-store-type"}>
                    <Avatar
                        style={{
                            color: "white",
                            backgroundColor: "#5A7C81",
                        }}
                    >
                        {" "}
                        {graph.getConfigName().charAt(0).toUpperCase()}
                    </Avatar>
                </TableCell>
                <TableCell aria-label={"graph-status"}>
                    <StatusChip status={graph.getStatus()} />
                </TableCell>
                <TableCell aria-label={"graph-url-ui"}>
                    <a // nosemgrep
                        id={graph.getId()}
                        href={sanitizer(graph.getUrl())} // nosemgrep
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {graph.getUrl()}
                    </a>
                </TableCell>
                <TableCell aria-label={"graph-url-rest"}>
                    <a // nosemgrep
                        id={graph.getId()}
                        href={sanitizer(graph.getRestUrl())} // nosemgrep
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {graph.getRestUrl()}
                    </a>
                </TableCell>
                <TableCell aria-label={"add-collaborator"}>
                    <Tooltip TransitionComponent={Zoom} title={`AddCollaborator ${graph.getId()}`}>
                        <IconButton
                            id={"add-collaborator-button-" + index}
                            aria-label={graph.getId() + "-add-collaborator-button"}
                            onClick={() => onClickAddcollaborator(graph.getId())}
                        >
                            <PersonAddOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                </TableCell>
                <TableCell aria-label={"view-graph-collaborators"}>
                    <Tooltip TransitionComponent={Zoom} title={`ViewGraphCollaborators ${graph.getId()}`}>
                        <IconButton
                            id={"view-graph-collaborators-button-" + index}
                            aria-label={graph.getId() + "-view-graph-collaborators-button"}
                            onClick={() => onClickViewGraphCollaborator(graph.getId())}
                        >
                            <PeopleAltOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                </TableCell>
                <TableCell aria-label={"graph-lifetim-iIn-days"}>{graph.getGraphAutoDestroyDate()}</TableCell>
                <TableCell aria-label={"duplicate-graph"}>
                    <Tooltip TransitionComponent={Zoom} title={`DuplicateGraph ${graph.getId()}`}>
                        <IconButton
                            id={"duplicate-graph-button-" + index}
                            aria-label={graph.getId() + "-duplicate-graph-button"}
                            onClick={() => onClickDuplicateGraph(graph)}
                        >
                            <ContentCopyOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                </TableCell>
                <TableCell aria-label={"delete-graph"}>
                    <Tooltip TransitionComponent={Zoom} title={`Delete ${graph.getId()}`}>
                        <IconButton
                            id={"view-graphs-delete-button-" + index}
                            aria-label={graph.getId() + "-delete-button"}
                            onClick={async () => onClickDelete(graph.getId())}
                        >
                            <DeleteOutlineOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={rowIsExpanded} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            <Table size="small" aria-label="graph-details">
                                <TableBody>
                                    <TableRow aria-label={"graph-description"}>
                                        <TableCell component="th" scope="row">
                                            Description: {graph.getDescription()}
                                        </TableCell>
                                    </TableRow>
                                    {federatedStores.includes(graph.getConfigName()) && (
                                        <TableRow
                                            id={"federated-graph-ids-" + index}
                                            aria-label={"federated-graph-ids"}
                                        >
                                            <TableCell component="th" scope="row">
                                                {allGraphIdsText}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}
