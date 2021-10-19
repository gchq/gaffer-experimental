import React, {ReactElement} from "react";
import {Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";

export default function AddEntity(): ReactElement {
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