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
    onChangeDeleteDate(deleteDate: string): void;
}
export default function DeleteDateSelect(props: IProps): ReactElement {
    const { value, onChangeDeleteDate } = props;
    return (
        <Grid item xs={12} id={"deletedate-select-grid"} aria-label="delete-date-grid">
            <FormControl variant="outlined" id={"deletedate-formcontrol"} aria-label="delete-date-input" fullWidth>
                <InputLabel
                    aria-label="delete-date-input-label"
                    style={{ fontSize: "20px" }}
                    htmlFor={"deletedate-select"}
                    id={"deletedate-select-label"}
                >
                    Delete Date
                </InputLabel>
                <Box my={1} />
                <Select
                    inputProps={{
                        name: "Delete Date",
                        id: "delete-date-input",
                        "aria-label": "delete-date-input",
                    }}
                    labelId="deletedate-select-label"
                    id="deletedate-select"
                    aria-label="delete-date-select"
                    fullWidth
                    value={value}
                    onChange={(event) => {
                        onChangeDeleteDate(event.target.value as string);
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
                        10
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
                        NEVER
                    </MenuItem>
                </Select>
                <FormHelperText id="deletedate-form-helper"></FormHelperText>
            </FormControl>
        </Grid>
    );
}
