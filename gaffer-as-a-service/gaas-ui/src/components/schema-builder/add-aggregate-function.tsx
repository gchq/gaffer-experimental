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
    onAddAggregateFunction(aggregateFunction: object): void;
}

interface IState {
    aggregateFunction: {
        class: string;
    };
}

export default function AddAggregateFunction(props: IProps): ReactElement {
    const { onAddAggregateFunction } = props;

    const initialState: IState = {
        aggregateFunction: {
            class: "",
        },
    };

    function addAggregateFunctionSubmit() {
        onAddAggregateFunction(state.aggregateFunction);
        dispatch({ type: "reset" });
    }
    function disableButton(): boolean {
        return state.aggregateFunction.class.length === 0;
    }

    function addEdgeReducer(draft: any, action: any) {
        switch (action.type) {
            case "reset":
                return initialState;
            case "validateAggregateFunctionValue":
                draft.aggregateFunction.class = action.value;
                return;
        }
    }
    const [state, dispatch] = useImmerReducer(addEdgeReducer, initialState);

    return (
        <Grid container spacing={2} direction="column" id={"add-aggregate-function-inputs"}>
            <Grid item>
                <TextField
                    id={"aggregate-function-value-input"}
                    label={"Aggregate Function Value"}
                    aria-label="aggregate-function-value-input"
                    inputProps={{
                        name: "Aggregate Function Value",
                        id: "aggregate-function-value-input",
                        "aria-label": "aggregate-function-value-input",
                    }}
                    name={"aggregate-function-value"}
                    value={state.aggregateFunction.class}
                    variant="outlined"
                    fullWidth
                    required
                    onChange={(e) => dispatch({ type: "validateAggregateFunctionValue", value: e.target.value })}
                />
            </Grid>
            <Box display="flex" alignItems="center" justifyContent="center">
                <Button
                    id={"add-aggregate-function-button"}
                    name={"Add Aggregate Function"}
                    disabled={disableButton()}
                    variant="outlined"
                    onClick={addAggregateFunctionSubmit}
                >
                    Add Aggregate Function
                </Button>
            </Box>
        </Grid>
    );
}
