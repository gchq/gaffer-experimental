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

import React, { ReactElement } from "react";
import { Box, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select } from "@material-ui/core";
interface IProps {
    value: string;
    allStoreTypes: Array<string>;
    onChangeStoreType(storeType: string): void;
}
export default function StoreTypeSelect(props: IProps): ReactElement {
    const { value, allStoreTypes, onChangeStoreType } = props;
    return (
        <Grid item xs={12} id={"storetype-select-grid"} aria-label="store-type-grid">
            <FormControl variant="outlined" id={"storetype-formcontrol"} aria-label="store-type-input" fullWidth>
                <InputLabel
                    aria-label="store-type-input-label"
                    style={{ fontSize: "20px" }}
                    htmlFor={"storetype-select"}
                    id={"storetype-select-label"}
                >
                    Store Type
                </InputLabel>
                <Box my={1} />
                <Select
                    inputProps={{
                        name: "Store Type",
                        id: "store-type-input",
                        "aria-label": "store-type-input",
                    }}
                    labelId="storetype-select-label"
                    id="storetype-select"
                    aria-label="store-type-select"
                    fullWidth
                    value={value}
                    onChange={(event) => {
                        onChangeStoreType(event.target.value as string);
                    }}
                >
                    {allStoreTypes.map((store: string) => (
                        <MenuItem
                            value={store}
                            aria-label={store + "-menu-item"}
                            id={store + "-menu-item"}
                            aria-labelledby={"storetype-select-label"}
                        >
                            {store}
                        </MenuItem>
                    ))}
                </Select>
                <FormHelperText id="storetype-form-helper">
                    {allStoreTypes.length === 0 ? "No storetypes available" : ""}
                </FormHelperText>
            </FormControl>
        </Grid>
    );
}
