/*
 * Copyright 2021-2022 Crown Copyright
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

import React, { ReactElement, useState } from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import { InputLabel } from "@material-ui/core";

interface IProps {
    graphIdValue: string;
    descriptionValue: string;
    onChangeGraphId(graphId: string, graphIdIsValid: boolean): void;
    onChangeDescription(graphId: string, graphDescriptionIsValid: boolean): void;
}

export default function GraphIdDescriptionInput(props: IProps): ReactElement {
    const { graphIdValue, descriptionValue, onChangeGraphId, onChangeDescription } = props;
    const [graphIdErrorHelperText, setGraphIdErrorHelperText] = useState("");
    const [descriptionErrorHelperText, setDescriptionErrorHelperText] = useState("");

    return (
        <>
            <Grid item xs={12} id={"id-description-fields"} aria-label="id-description-fields">
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
                <InputLabel aria-label="graph-description-input-label" id="graph-description-input-label" required>
                    Graph Description
                </InputLabel>
                <TextField
                    id="graph-description"
                    aria-label="graph-description-input"
                    inputProps={{
                        name: "Graph Description",
                        id: "graph-description-input",
                        "aria-label": "graph-description-input",
                    }}
                    value={descriptionValue}
                    error={descriptionErrorHelperText.length > 0}
                    required
                    multiline
                    autoFocus
                    rows={5}
                    fullWidth
                    name="graph-description"
                    variant="outlined"
                    helperText={descriptionErrorHelperText}
                    onChange={(event) => {
                        const regex = new RegExp("^[a-zA-Z0-9 ]*$");
                        if (regex.test(event.target.value)) {
                            onChangeDescription(event.target.value, true);
                            setDescriptionErrorHelperText("");
                        } else {
                            onChangeDescription(event.target.value, false);
                            setDescriptionErrorHelperText("Graph Description can only contain numbers and letters");
                        }
                    }}
                />
            </Grid>
        </>
    );
}
