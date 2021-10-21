import React, {ReactElement, useState} from "react";
import {Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";
import {useImmerReducer} from "use-immer"

export default function AddEntity(): ReactElement {

    const instialState = {
        entityname: {
            value: "",
            hassErrors: false,
            message: ""
        },

        entityDescription: {
            value: "",
            hassErrors: false,
            message: ""
        }
    }

    function ourReducer(draft:any, action: any) {

        switch(action.type){
            case "validateEntityeName":
                draft.entityname.hassErrors = false
                draft.entityname.value = action.value
                draft.entityname.message="";
                if(draft.entityname.value && !/^[a-zA-Z]*$/.test(draft.entityname.value)){
                    draft.entityname.hassErrors = true
                    draft.entityname.message = "Entity name can only contain letters"
                }
                return
            case "validateEntityDescription":
                draft.entityDescription.hassErrors = false
                draft.entityDescription.value = action.value
                draft.entityDescription.message=""
              if(draft.entityDescription.value  && !/^[a-zA-Z0-9\s]*$/.test(draft.entityDescription.value)){
                    draft.entityDescription.hassErrors = true
                    draft.entityDescription.message = "Entity description can only contain alpha numeric letters and spaces"
                }
                return
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer,instialState)

    function disableAddEntityButton(): boolean {
        return (
            (state.entityname.value.length === 0 || state.entityname.hassErrors) ||
            (state.entityDescription.value.length === 0 || state.entityDescription.hassErrors)
        )
    }
    
    return (
        <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            id={"add-entity-inputs"}
        >
            <TextField
                id={"entity-name-input"}
                label={"Entity Name"}
                aria-label="entity-name-input"
                inputProps={{
                    name: "Entity Name",
                    id: "entity-name-input",
                    "aria-label": "entity-name-input"
                }}
                name={"entity-name"}
                error={state.entityname.hassErrors}
                required
                autoFocus
                onChange={(e) => dispatch({type: "validateEntityeName", value: e.target.value})}
                helperText={state.entityname.message}
            />
            <TextField
                id={"entity-description-input"}
                label={"Description"}
                aria-label="entity-description-input"
                inputProps={{
                    name: "Entity Description",
                    id: "entity-description-input",
                    "aria-label": "entity-description-input"
                }}
                name={"entity-description"}
                error={state.entityDescription.hassErrors}
                required
                autoFocus
                onChange={(e) => dispatch({type: "validateEntityDescription", value: e.target.value})}
                helperText={state.entityDescription.message}
            />
            <FormControl fullWidth id={"entity-vertex-formcontrol"}>
                <InputLabel id="entity-vertex-select-label">Vertex</InputLabel>
                <Select
                    labelId="entity-vertex-select-label"
                    id="entity-vertex-select"
                    label="Vertex"
                >
                    <MenuItem value={"type 1"}>Type 1</MenuItem>
                    <MenuItem value={"type 2"}>Type 2</MenuItem>
                </Select>
            </FormControl>
            <Button
                id={"add-entity-button"}
                name={"Add Entity"}
                disabled={disableAddEntityButton()}
            >
                Add Entity
            </Button>

        </Grid>
    );
}