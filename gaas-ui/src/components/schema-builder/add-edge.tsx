import React, {ReactElement} from "react";
import {Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";

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