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
import { GraphCollaborator } from "../../domain/graph-collaborator";
import {
    Grid,
    makeStyles,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";

interface IProps {
    graphCollaborators: GraphCollaborator[];
    //  deleteGraph: (username: string) => void;
    //  refreshTable: () => void;
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
            </Grid>
        </Grid>
    );
}

function MainGraphCollaboratorTableRow(props: IGraphCollaboratorRow) {
    const { graphCollaborator, index } = props;
    const classes = useStyles();

    return (
        <React.Fragment>
            <TableRow className={classes.root} hover aria-label={"view-collaborators-table"}>
                <TableCell component="th" scope="row" aria-label={"row-id"}>
                    {graphCollaborator.getId()}
                </TableCell>
                <TableCell component="th" scope="row" aria-label={"row-id"}>
                    {graphCollaborator.getUsername()}
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}
