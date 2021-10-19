import React, {ReactElement} from "react";
import {Button, Grid, TextField} from "@material-ui/core";

export default function AddType(): ReactElement {
    return(
        <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            id={"add-type-inputs"}
        >
            <TextField
                id={"type-name-input"}
                label={"Type Name"}
                aria-label="type-name-input"
                inputProps={{
                    name: "Type Name",
                    id: "type-name-input",
                    "aria-label": "type-name-input"
                }}
                name={"type-name"}
            />
            <TextField
                id={"type-description-input"}
                label={"Description"}
                aria-label="type-description-input"
                inputProps={{
                    name: "Type Description",
                    id: "type-description-input",
                    "aria-label": "type-description-input"
                }}
                name={"type-description"}
            />
            <TextField
                id={"type-class-input"}
                label={"Class"}
                aria-label="type-class-input"
                inputProps={{
                    name: "Type Class",
                    id: "type-class-input",
                    "aria-label": "type-class-input"
                }}
                name={"type-class"}
            />
            <Button
                id={"add-type-button"}
                name={"Add Type"}
            >
                Add Type
            </Button>
            
        </Grid>
    )
}