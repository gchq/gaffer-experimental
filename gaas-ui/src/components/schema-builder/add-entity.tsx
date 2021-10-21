import React, {ReactElement, useState} from "react";
import {Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";
import {useImmerReducer} from 'use-immer'

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
                draft.entityname.hasErrrors = false
                draft.entityname.value = action.value
                if(draft.entityname.value && !/^[a-zA-Z]*$/.test(draft.entityname.value)){
                    draft.entityname.hasErrrors = false
                    draft.entityname.message = "Entity name can only contain lowercase letters"
                }
                return
            case "validateEntityDescription":
                draft.entityDescription.hasErrrors = false
                draft.entityDescription.value = action.value
              if(draft.entityDescription.value && !/^[a-zA-Z0-9]*$/.test(draft.entityDescription.value)){
                    draft.entityDescription.hasErrrors = false
                    draft.entityDescription.message = "Entity description can only contain numbers and lowercase letters"
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
                variant="outlined"
                error={state.entityname.message.length > 0}
                required
                fullWidth
                autoFocus
                onChange={e => dispatch({type: "validateEntityeName", value: e.target.value})}
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
                variant="outlined"
                error={state.entityDescription.message.length > 0}
                required
                fullWidth
                autoFocus
                onChange={e => dispatch({type: "validateEntityDescription", value: e.target.value})}
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
            >
                Add Entity
            </Button>

        </Grid>
    );
}