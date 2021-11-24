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
                    variant="outlined"
                    onClick={addAggregateFunctionSubmit}
                >
                    Add Aggregate Function
                </Button>
            </Box>
        </Grid>
    );
}
