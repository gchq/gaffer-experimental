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

import { Box, Button, Grid, TextField } from "@material-ui/core";
import React, { ReactElement } from "react";
import { useImmerReducer } from "use-immer";

interface IProps {
    onAddGroupby(groupBy: string): void;
}

interface IState {
    groupBy: string;
}

export default function AddGroupby(props: IProps): ReactElement {
    const { onAddGroupby } = props;

    const initialState: IState = {
        groupBy: "",
    };

    function addGroupbySubmit() {
        onAddGroupby(state.groupBy);
        dispatch({ type: "reset" });
    }

    function addGroupbyReducer(draft: any, action: any) {
        switch (action.type) {
            case "reset":
                return initialState;
            case "validateGroupbyKey":
                draft.groupBy = action.value;
                return;
        }
    }
    function disableButton(): boolean {
        return state.groupBy.length === 0;
    }
    const [state, dispatch] = useImmerReducer(addGroupbyReducer, initialState);

    return (
        <Grid container spacing={2} direction="column" id={"add-groupby-inputs"}>
            <Grid item>
                <TextField
                    id={"groupby-key-input"}
                    label={"Groupby Key"}
                    aria-label="groupby-key-input"
                    inputProps={{
                        name: "Groupby Key",
                        id: "groupby-key-input",
                        "aria-label": "groupby-key-input",
                    }}
                    name={"groupby-key"}
                    value={state.groupBy}
                    variant="outlined"
                    fullWidth
                    required
                    onChange={(e) => dispatch({ type: "validateGroupbyKey", value: e.target.value })}
                />
            </Grid>
            <Box display="flex" alignItems="center" justifyContent="center">
                <Button
                    id={"add-groupby-button-groupby-dialog"}
                    name={"Add Groupby"}
                    variant="outlined"
                    disabled={disableButton()}
                    onClick={addGroupbySubmit}
                >
                    Add Groupby
                </Button>
            </Box>
        </Grid>
    );
}
