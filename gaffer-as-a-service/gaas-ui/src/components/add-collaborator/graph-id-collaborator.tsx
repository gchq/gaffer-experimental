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

import React, { ReactElement, useState } from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import { InputLabel } from "@material-ui/core";

interface IProps {
    graphIdValue: string;
    collaboratorValue: string;
    onChangeGraphId(graphId: string, graphIdIsValid: boolean): void;
    onChangeCollaborator(graphId: string, graphCollaboratorIsValid: boolean): void;
}

export default function GraphIdCollaboratorInput(props: IProps): ReactElement {
    const { graphIdValue, collaboratorValue, onChangeGraphId, onChangeCollaborator } = props;
    const [graphIdErrorHelperText, setGraphIdErrorHelperText] = useState("");
    const [collaboratorErrorHelperText, setCollaboratorErrorHelperText] = useState("");

    return (
        <>
            <Grid item xs={12} id={"id-collaborator-fields"} aria-label="id-collaborator-fields">
                <InputLabel aria-label="graph-id-input-label" id="graph-id-input-label" required>
                    Graph Id
                </InputLabel>
                <TextField
                    id="graph-id"
                    inputProps={{
                        name: "Graph ID",
                        id: "graph-id-input",
                        "aria-label": "graph-id-input",
                    }}
                    aria-label="graph-id-input"
                    variant="outlined"
                    value={graphIdValue}
                    error={graphIdErrorHelperText.length > 0}
                    required
                    fullWidth
                    autoFocus
                    helperText={graphIdErrorHelperText}
                    name="graph-id"
                    onChange={(event) => {
                        const regex = new RegExp("^[a-z0-9]*$");
                        if (regex.test(event.target.value)) {
                            onChangeGraphId(event.target.value, true);
                            setGraphIdErrorHelperText("");
                        } else {
                            onChangeGraphId(event.target.value, false);
                            setGraphIdErrorHelperText("Graph ID can only contain numbers and lowercase letters");
                        }
                    }}
                />
            </Grid>
            <Grid item xs={12} container direction="row" justify="flex-end" alignItems="center"></Grid>
            <Grid item xs={12}>
                <InputLabel aria-label="graph-collaborator-input-label" id="graph-collaborator-input-label" required>
                    Graph Collaborator
                </InputLabel>
                <TextField
                    id="graph-collaborator"
                    aria-label="graph-collaborator-input"
                    inputProps={{
                        name: "Graph Collaborator",
                        id: "graph-collaborator-input",
                        "aria-label": "graph-collaborator-input",
                    }}
                    value={collaboratorValue}
                    error={collaboratorErrorHelperText.length > 0}
                    required
                    multiline
                    autoFocus
                    fullWidth
                    name="graph-collaborator"
                    variant="outlined"
                    helperText={collaboratorErrorHelperText}
                    onChange={(event) => {
                        const regex = new RegExp("^[a-zA-Z0-9 ]*$");
                        if (regex.test(event.target.value)) {
                            onChangeCollaborator(event.target.value, true);
                            setCollaboratorErrorHelperText("");
                        } else {
                            onChangeCollaborator(event.target.value, false);
                            setCollaboratorErrorHelperText("Graph Collaborator can only contain numbers and letters");
                        }
                    }}
                />
            </Grid>
        </>
    );
}
