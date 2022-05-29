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

import React, { ReactElement } from "react";
import { Box, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select } from "@material-ui/core";
interface IProps {
    value: string;
    onChangeGraphLifetimeInDays(graphLifetimeInDays: string): void;
}
export default function GraphLifetimeInDaysSelect(props: IProps): ReactElement {
    const { value, onChangeGraphLifetimeInDays } = props;
    return (
        <Grid item xs={12} id={"graphlifetimeindays-select-grid"} aria-label="graph-lifetime-in-days-grid">
            <FormControl
                variant="outlined"
                id={"graph-lifetime-in-days-formcontrol"}
                aria-label="graph-lifetime-in-days-input"
                fullWidth
            >
                <InputLabel
                    aria-label="graph-lifetime-in-days-input-label"
                    style={{ fontSize: "20px" }}
                    htmlFor={"graphlifetimeindays-select"}
                    id={"graphlifetimeindays-select-label"}
                >
                    Graph Lifetime In Days
                </InputLabel>
                <Box my={1} />
                <Select
                    inputProps={{
                        name: "Graph Lifetime In Days",
                        id: "graph-lifetime-in-days-input",
                        "aria-label": "graph-lifetime-in-days-input",
                    }}
                    labelId="graphlifetimeindays-select-label"
                    id="graphlifetimeindays-select"
                    aria-label="graphlifetimeindays-select"
                    fullWidth
                    value={value}
                    onChange={(event) => {
                        onChangeGraphLifetimeInDays(event.target.value as string);
                    }}
                >
                    <MenuItem
                        value={"10"}
                        aria-label={"10-menu-item"}
                        id={"10-menu-item"}
                        aria-labelledby={"10-select-label"}
                    >
                        10
                    </MenuItem>
                    <MenuItem
                        value={"20"}
                        aria-label={"20-menu-item"}
                        id={"20-menu-item"}
                        aria-labelledby={"20-select-label"}
                    >
                        20
                    </MenuItem>
                    <MenuItem
                        value={"30"}
                        aria-label={"309-menu-item"}
                        id={"30-menu-item"}
                        aria-labelledby={"30-select-label"}
                    >
                        30
                    </MenuItem>
                    <MenuItem
                        value={"never"}
                        aria-label={"never-menu-item"}
                        id={"never-menu-item"}
                        aria-labelledby={"never-select-label"}
                    >
                        never
                    </MenuItem>
                </Select>
                <FormHelperText id="graphlifetimeindays-form-helper"></FormHelperText>
            </FormControl>
        </Grid>
    );
}
