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
    usernameValue: string;
    onChangeUsername(graphId: string, usernameIsValid: boolean): void;
}

export default function GraphIdUsernameInput(props: IProps): ReactElement {
    const { graphIdValue, usernameValue, onChangeUsername } = props;
    const [usernameErrorHelperText, setUsernameErrorHelperText] = useState("");

    return (
        <>
            <Grid item xs={12} id={"id-collaborator-fields"} aria-label="id-collaborator-fields">
                <InputLabel aria-label="graph-id-input-label" id="graph-id-input-label" required>
                    Graph Id
                </InputLabel>
                <TextField
                    id="graph-id"
                    aria-label="graph-id-input"
                    variant="outlined"
                    value={graphIdValue}
                    required
                    fullWidth
                    autoFocus
                    name="graph-id"
                    disabled
                />
            </Grid>
            <Grid item xs={12} container direction="row" justify="flex-end" alignItems="center"></Grid>
            <Grid item xs={12} id={"id-username-fields"} aria-label="id-username-fields">
                <InputLabel aria-label="username-input-label" id="username-input-label" required>
                    User name
                </InputLabel>
                <TextField
                    id="username"
                    aria-label="username-input"
                    inputProps={{
                        name: "User Name",
                        id: "username-input",
                        "aria-label": "username-input",
                    }}
                    variant="outlined"
                    value={usernameValue}
                    error={usernameErrorHelperText.length > 0}
                    required
                    fullWidth
                    autoFocus
                    helperText={usernameErrorHelperText}
                    name="username"
                    onChange={(event) => {
                        const regex = new RegExp("^[ A-Za-z0-9_@.-]*$");
                        if (regex.test(event.target.value)) {
                            onChangeUsername(event.target.value, true);
                            setUsernameErrorHelperText("");
                        } else {
                            onChangeUsername(event.target.value, false);
                            setUsernameErrorHelperText(
                                "User name can only contain alphanumeric and some special characters @ . - _"
                            );
                        }
                    }}
                />
            </Grid>
        </>
    );
}
