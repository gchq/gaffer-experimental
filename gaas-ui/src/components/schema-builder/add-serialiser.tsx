import { Box, Button, Grid, TextField } from "@material-ui/core";
import React, { ReactElement } from "react";
import { useImmerReducer } from "use-immer";

interface IProps {
    onAddSerialiser(properties: object): void;
}

interface IState {
    serialiser: {
        key: string;
        value: string;
    };
}

export default function AddSerialiser(props: IProps): ReactElement {
    const { onAddSerialiser } = props;

    const initialState: IState = {
        serialiser: {
            key: "class",
            value: "",
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
                draft.serialiser.value = action.value;
                return;
        }
    }
    const [state, dispatch] = useImmerReducer(addEdgeReducer, initialState);

    return (
        <Grid container spacing={2} direction="column" id={"add-property-inputs"}>
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
                    value={state.serialiser.value}
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
                >
                    Add Serialiser
                </Button>
            </Box>
        </Grid>
    );
}
