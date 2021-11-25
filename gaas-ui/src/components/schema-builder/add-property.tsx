import { Box, Button, Grid, TextField } from "@material-ui/core";
import React, { ReactElement } from "react";
import { useImmerReducer } from "use-immer";

interface IProps {
    onAddProperty(properties: object): void;
}

interface IState {
    property: {
        key: string;
        value: string;
    };
    hasErrors: boolean;
}

export default function AddProperty(props: IProps): ReactElement {
    const { onAddProperty } = props;

    const initialState: IState = {
        property: {
            value: "",
            key: "",
        },
        hasErrors: false,
    };

    function addPropertySubmit() {
        onAddProperty({
            [state.property.key]: state.property.value,
        });
        dispatch({ type: "reset" });
    }

    function disableButton(): boolean {
        return state.property.key.length === 0 || state.property.value.length === 0;
    }

    function addEdgeReducer(draft: any, action: any) {
        switch (action.type) {
            case "reset":
                return initialState;
            case "validatePropertyKey":
                draft.hasErrors = false;
                draft.property.key = action.value;
                return;
            case "validatePropertyValue":
                draft.hasErrors = false;
                draft.property.value = action.value;
                return;
        }
    }
    const [state, dispatch] = useImmerReducer(addEdgeReducer, initialState);

    return (
        <Grid container spacing={2} direction="column" id={"add-property-inputs"}>
            <Grid item>
                <TextField
                    id={"property-key-input"}
                    label={"Property Key"}
                    aria-label="property-key-input"
                    inputProps={{
                        name: "Property Key",
                        id: "property-key-input",
                        "aria-label": "property-key-input",
                    }}
                    name={"property-key"}
                    value={state.property.key}
                    variant="outlined"
                    fullWidth
                    error={state.hasErrors}
                    required
                    onChange={(e) => dispatch({ type: "validatePropertyKey", value: e.target.value })}
                />
            </Grid>
            <Grid item>
                <TextField
                    id={"property-value-input"}
                    label={"Property Value"}
                    aria-label="property-value-input"
                    inputProps={{
                        name: "Property Value",
                        id: "property-value-input",
                        "aria-label": "property-value-input",
                    }}
                    name={"property-value"}
                    value={state.property.value}
                    variant="outlined"
                    fullWidth
                    error={state.hasErrors}
                    required
                    onChange={(e) => dispatch({ type: "validatePropertyValue", value: e.target.value })}
                />
            </Grid>
            <Box display="flex" alignItems="center" justifyContent="center">
                <Button
                    id={"add-property-button"}
                    name={"Add Property"}
                    variant="outlined"
                    onClick={addPropertySubmit}
                    disabled={disableButton()}
                >
                    Add Property
                </Button>
            </Box>
        </Grid>
    );
}
