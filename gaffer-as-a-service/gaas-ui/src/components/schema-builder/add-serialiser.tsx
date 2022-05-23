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

import { Box, Button, Grid, TextField } from "@material-ui/core";
import React, { ReactElement } from "react";
import { useImmerReducer } from "use-immer";

interface IProps {
    onAddSerialiser(serialiser: object): void;
}

interface IState {
    serialiser: {
        class: string;
    };
}

export default function AddSerialiser(props: IProps): ReactElement {
    const { onAddSerialiser } = props;

    const initialState: IState = {
        serialiser: {
            class: "",
        },
    };

    function onAddSerialiserSubmit() {
        onAddSerialiser(state.serialiser);
        dispatch({ type: "reset" });
    }

    function addEdgeReducer(draft: any, action: any) {
        switch (action.type) {
            case "reset":
                return initialState;
            case "validateSerialiserValue":
                draft.serialiser.class = action.value;
                return;
        }
    }

    const [state, dispatch] = useImmerReducer(addEdgeReducer, initialState);

    return (
        <Grid container spacing={2} direction="column" id={"add-serialiser-inputs"}>
            <Grid item>
                <TextField
                    id={"serialiser-value-input"}
                    label={"Serialiser Value"}
                    aria-label="serialiser-value-input"
                    inputProps={{
                        name: "Serialiser Value",
                        id: "serialiser-value-input",
                        "aria-label": "serialiser-value-input",
                    }}
                    name={"serialiser-value"}
                    value={state.serialiser.class}
                    variant="outlined"
                    fullWidth
                    required
                    onChange={(e) => dispatch({ type: "validateSerialiserValue", value: e.target.value })}
                />
            </Grid>
            <Box display="flex" alignItems="center" justifyContent="center">
                <Button
                    id={"add-serialiser-button"}
                    name={"Add Serialiser"}
                    variant="outlined"
                    onClick={onAddSerialiserSubmit}
                    disabled={!state.serialiser.class}
                >
                    Add Serialiser
                </Button>
            </Box>
        </Grid>
    );
}
