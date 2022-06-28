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
import DeleteOutlineOutlinedIcon from "@material-ui/icons/DeleteOutlineOutlined";

interface IProps {
    graphCollaborators: GraphCollaborator[];
    deleteCollaborator: (graphId: string, username: string) => void;
}

interface IGraphCollaboratorRow {
    index: number;
    graphCollaborator: GraphCollaborator;
    onClickDelete: (graphId: string, username: string) => void;
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
                                    onClickDelete={(graphId: string, username: string) =>
                                        props.deleteCollaborator(graphId, username)
                                    }
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
    const { graphCollaborator, index, onClickDelete } = props;
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
                <TableCell aria-label={"delete-collaborator"}>
                    <Tooltip TransitionComponent={Zoom} title={`Delete ${graphCollaborator.getUsername()}`}>
                        <IconButton
                            id={"view-collaborator-delete-button-" + index}
                            aria-label={graphCollaborator.getUsername() + "-delete-button"}
                            onClick={async () =>
                                onClickDelete(graphCollaborator.getId(), graphCollaborator.getUsername())
                            }
                        >
                            <DeleteOutlineOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}
