import React, {ReactElement, useState} from "react";
import {Button, Grid, IconButton, TextField} from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";

interface IProps {
    onAddType(type: object) : void;
    onTypesClose() : void
}
export default function AddType(props: IProps): ReactElement {
    const {
        onAddType, onTypesClose
    } = props;
    const [typeName, setTypeName] = useState("");
    const [typeDescription, setTypeDescription]= useState("");
    const [typeClass, setTypeClass] = useState("");

    function addTypeSubmit() {
        const typeToAdd: any = {};
        typeToAdd[typeName] = {
            description: typeDescription,
            class: typeClass,
        }
        onAddType(typeToAdd);
    }
    return(
        <Grid>
            <IconButton
            id="close-add-type-button"
            onClick={onTypesClose}
            >
            <ClearIcon/>
            </IconButton>
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
                onChange={(event) => {
                    setTypeName(event.target.value as string);
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
                onChange={(event) => {
                    setTypeDescription(event.target.value as string);
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
                onChange={(event) => {
                    setTypeClass(event.target.value as string);
                }}
                name={"type-class"}
            />
            <Button
                id={"add-type-button"}
                name={"Add Type"}
                onClick={addTypeSubmit}
            >
                Add Type
            </Button>
            
        </Grid>
        </Grid>
    )
}