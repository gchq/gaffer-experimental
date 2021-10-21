
import React, {ReactElement, useState} from "react";
import {Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";
import {useImmerReducer} from 'use-immer'
export default function AddEdge(): ReactElement {


    const instialState = {
        edgename: {
            value: "",
            hassErrors: false,
            message: ""
        },

        edgeDescription: {
            value: "",
            hassErrors: false,
            message: ""
        }
    }

    function ourReducer(draft:any, action: any) {

        switch(action.type){
            case "validateEdgeName":
                draft.edgename.hasErrrors = false
                draft.edgename.value = action.value
                if(draft.edgename.value && !/^[a-zA-Z]*$/.test(draft.edgename.value)){
                    draft.edgename.hasErrrors = false
                    draft.edgename.message = "Edge name can only contain lowercase letters"
                }
                return
            case "validateEdgeDescription":
                draft.edgeDescription.hasErrrors = false
                draft.edgeDescription.value = action.value
              if(draft.edgeDescription.value && !/^[a-zA-Z0-9]*$/.test(draft.edgeDescription.value)){
                    draft.edgeDescription.hasErrrors = false
                    draft.edgeDescription.message = "Edge description can only contain numbers and lowercase letters"
                }
                return
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer,instialState)

    
    return (
        <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            id={"add-edge-inputs"}
        >
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
                error={state.edgename.message.length > 0}
                required
                fullWidth
                autoFocus
                onChange={e => dispatch({type: "validateEdgeName", value: e.target.value})}
                helperText={state.edgename.message}
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
                error={state.edgeDescription.message.length > 0}
                required
                fullWidth
                autoFocus
                onChange={e => dispatch({type: "validateEdgeDescription", value: e.target.value})}
                helperText={state.edgeDescription.message}
            />
            <FormControl fullWidth id={"edge-source-formcontrol"}>
                <InputLabel id="edge-source-select-label">Source</InputLabel>
                <Select
                    labelId="edge-source-select-label"
                    id="edge-source-select"
                    label="Source"
                >
                    <MenuItem value={"type 1"}>Type 1</MenuItem>
                    <MenuItem value={"type 2"}>Type 2</MenuItem>
                </Select>
            </FormControl>
            <FormControl fullWidth id={"edge-destination-formcontrol"}>
                <InputLabel id="edge-destination-select-label">Destination</InputLabel>
                <Select
                    labelId="edge-destination-select-label"
                    id="edge-destination-select"
                    label="Destination"
                >
                    <MenuItem value={"type 1"}>Type 1</MenuItem>
                    <MenuItem value={"type 2"}>Type 2</MenuItem>
                </Select>
            </FormControl>
            <FormControl fullWidth id={"edge-directed-formcontrol"}>
                <InputLabel id="edge-directed-select-label">Directed</InputLabel>
                <Select
                    labelId="edge-directed-select-label"
                    id="edge-directed-select"
                    label="Directed"
                >
                    <MenuItem value={"True"}>True</MenuItem>
                    <MenuItem value={"False"}>False</MenuItem>
                </Select>
            </FormControl>
            <Button
                id={"add-edge-button"}
                name={"Add Edge"}
            >
                Add Edge
            </Button>

        </Grid>
);
}