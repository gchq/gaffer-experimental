import React, {ReactElement} from "react";
import {Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";
import {useImmerReducer} from "use-immer";

export default function AddEdge(): ReactElement {
    const initialState = {
        edgeName: {
            value: "",
            hasErrors: false,
            message: ""
        },

        edgeDescription: {
            value: "",
            hasErrors: false,
            message: ""
        },

        edgeSource: {
            value: "",
            hasErrors: false
        },

        edgeDestination: {
            value: "",
            hasErrors: false
        },

        entityDirected: {
            value: "",
            hasErrors: false
        }
    };

    function addEdgeReducer(draft: any, action: any) {
        switch (action.type) {
        case "validateEdgeName":
            draft.edgeName.hasErrors = false;
            draft.edgeName.value = action.value;
            draft.edgeName.message = "";

            if (!/^[a-zA-Z]*$/.test(draft.edgeName.value)) {
                draft.edgeName.hasErrors = true;
                draft.edgeName.message = "Edge name can only contain letters";
            }
            return;

        case "validateEdgeDescription":
            draft.edgeDescription.hasErrors = false;
            draft.edgeDescription.value = action.value;
            draft.edgeDescription.message = "";

            if (draft.edgeDescription.value && !/^[a-zA-Z0-9\s]*$/.test(draft.edgeDescription.value)) {
                draft.edgeDescription.hasErrors = true;
                draft.edgeDescription.message = "Edge description can only contain alpha numeric letters and spaces";
            }
            return;

        case "validateEdgeSource":
            draft.edgeSource.hasErrors = false;
            draft.edgeSource.value = action.value;
            if (draft.edgeSource.value.length === 0) {
                draft.edgeSource.hasErrors = true;
            }
            return;

        case "validateEdgeDestination":
            draft.edgeDestination.hasErrors = false;
            draft.edgeDestination.value = action.value;
            if (draft.edgeDestination.value.length === 0) {
                draft.edgeDestination.hasErrors = true;
            }
            return;

        case "validateEntityDirected":
            draft.entityDirected.hasErrors = false;
            draft.entityDirected.value = action.value;
            if (draft.entityDirected.value.length === 0) {
                draft.entityDirected.hasErrors = true;
            }
            return;
        }
    }

    const [state, dispatch] = useImmerReducer(addEdgeReducer, initialState);

    function disableAddEdgeButton(): boolean {
        return state.edgeName.value.length === 0 || state.edgeName.hasErrors || state.edgeDescription.value.length === 0 || state.edgeDescription.hasErrors || state.edgeSource.value.length === 0 || state.edgeDestination.value.length === 0 || state.entityDirected.value.length === 0;
    }

    return (
        <Grid container direction="column" justify="center" alignItems="center" id={"add-edge-inputs"}>
            <TextField
                id={"edge-name-input"}
                label={"Edge Name"}
                aria-label="edge-name-input"
                inputProps={{
                    name: "Edge Name",
                    id: "edge-name-input",
                    "aria-label": "edge-name-input"
                }}
                name={"edge-name"}
                variant="outlined"
                error={state.edgeName.hasErrors}
                required
                onChange={(e) => dispatch({type: "validateEdgeName", value: e.target.value})}
                helperText={state.edgeName.message}
            />
            <TextField
                id={"edge-description-input"}
                label={"Description"}
                aria-label="edge-description-input"
                inputProps={{
                    name: "Edge Description",
                    id: "edge-description-input",
                    "aria-label": "edge-description-input"
                }}
                name={"edge-description"}
                variant="outlined"
                error={state.edgeDescription.hasErrors}
                required
                onChange={(e) => dispatch({type: "validateEdgeDescription", value: e.target.value})}
                helperText={state.edgeDescription.message}
            />
            <FormControl fullWidth id={"edge-source-formcontrol"}>
                <InputLabel id="edge-source-select-label" required>
                    Source
                </InputLabel>
                <Select labelId="edge-source-select-label" id="edge-source-select" label="Source"
                        onChange={(e) => dispatch({type: "validateEdgeSource", value: e.target.value})}>
                    <MenuItem value={"type 1"}>Type 1</MenuItem>
                    <MenuItem value={"type 2"}>Type 2</MenuItem>
                </Select>
            </FormControl>
            <FormControl fullWidth id={"edge-destination-formcontrol"}>
                <InputLabel id="edge-destination-select-label" required>
                    Destination
                </InputLabel>
                <Select labelId="edge-destination-select-label" id="edge-destination-select" label="Destination"
                        onChange={(e) => dispatch({type: "validateEdgeDestnation", value: e.target.value})}>
                    <MenuItem value={"type 1"}>Type 1</MenuItem>
                    <MenuItem value={"type 2"}>Type 2</MenuItem>
                </Select>
            </FormControl>
            <FormControl fullWidth id={"edge-directed-formcontrol"}>
                <InputLabel id="edge-directed-select-label" required>
                    Directed
                </InputLabel>
                <Select labelId="edge-directed-select-label" id="edge-directed-select" label="Directed"
                        onChange={(e) => dispatch({type: "validateEntityDirected", value: e.target.value})}>
                    <MenuItem value={"True"}>True</MenuItem>
                    <MenuItem value={"False"}>False</MenuItem>
                </Select>
            </FormControl>
            <Button id={"add-edge-button"} name={"Add Edge"} color="primary" disabled={disableAddEdgeButton()}>
                Add Edge
            </Button>
        </Grid>
    );
}
