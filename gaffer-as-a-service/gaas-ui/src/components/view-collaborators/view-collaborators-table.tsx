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

import React, { useEffect } from "react";
import { GraphCollaborator } from "../../domain/graph-collaborator";
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
import { sanitizeUrl } from "@braintree/sanitize-url";

interface IProps {
    graphCollaborators: GraphCollaborator[];
    //  deleteGraph: (username: string) => void;
    refreshTable: () => void;
}

interface IGraphCollaboratorRow {
    index: number;
    graphCollaborator: GraphCollaborator;
    //onClickDelete: (graphId: string) => void;
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

export function ViewCollaboratorsTable(props: IProps) {
    const classes = useStyles();

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <TableContainer component={Paper}>
                    <Table size="medium" className={classes.table} aria-label="Graphs Table">
                        <TableHead>
                            <TableRow style={{ background: "#F4F2F2" }}>
                                <TableCell />
                                <TableCell>Graph ID</TableCell>
                                <TableCell>User Name</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {props.graphCollaborators.map((graphCollaborator: GraphCollaborator, index) => (
                                <MainGraphCollaboratorTableRow
                                    key={graphCollaborator.getId()}
                                    index={index}
                                    graphCollaborator={graphCollaborator}
                                    // onClickDelete={(graphId: string) => props.deleteGraph(graphId)}
                                />
                            ))}
                        </TableBody>
                        {props.graphCollaborators.length === 0 && <caption>No Collaborators.</caption>}
                    </Table>
                </TableContainer>

                <Grid container style={{ margin: 10 }} direction="row" justify="center" alignItems="center">
                    <Button
                        id="view-collaborators-refresh-button"
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

function MainGraphCollaboratorTableRow(props: IGraphCollaboratorRow) {
    const { graphCollaborator, index } = props;
    const classes = useStyles();
    const [rowIsExpanded, setRowIsExpanded] = React.useState(false);
    const sanitizer = (url: string): string => {
        const regex = new RegExp("[^-A-Za-z0-9+&@#/%?=~_|!:,.;()]");
        if (regex.test(url)) {
            return "";
        }
        return sanitizeUrl(url);
    };

    return (
        <React.Fragment>
            <TableRow className={classes.root} hover aria-label={"view-collaborators-table"}>
                <TableCell aria-label={"expand-row-icon"}>
                    <IconButton
                        id={"expand-row-button-" + index}
                        aria-label={graphCollaborator.getId() + "-expand-button"}
                        size="small"
                        onClick={() => setRowIsExpanded(!rowIsExpanded)}
                    >
                        {rowIsExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row" aria-label={"row-id"}>
                    {graphCollaborator.getId()}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={rowIsExpanded} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            <Table size="small" aria-label="collaborator-details">
                                <TableBody>
                                    <TableRow aria-label={"username"}>
                                        <TableCell component="th" scope="row">
                                            Username: {graphCollaborator.getUsername()}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}
