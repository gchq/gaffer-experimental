import React, {ReactElement} from "react";
import {Box, FormControl, Grid, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";

export default function AddEdge(): ReactElement {
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
            />
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


        </Grid>
);
}