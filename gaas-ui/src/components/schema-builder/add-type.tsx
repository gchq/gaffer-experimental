import React, {ReactElement, useState} from "react";
import {Button, Grid, IconButton, TextField} from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";

interface IProps {
    onAddType(type: object) : void;
}
export default function AddType(props: IProps): ReactElement {
    const {
        onAddType
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
        setTypeName("");
        setTypeDescription("");
        setTypeClass("");
    }
    return(
        <Grid
            id={"add-type-component"}
        >
        <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            id={"add-type-inputs"}
        >
            <TextField
                id={"type-name-textfield"}
                label={"Type Name"}
                value={typeName}
                aria-label="type-name-textfield"
                inputProps={{
                    name: "Type Name",
                    id: "type-name-input",
                    "aria-label": "type-name-input"
                }}
                onChange={(event) => {
                    setTypeName(event.target.value as string);
                }}
                name={"type-name"}
                autoComplete="type-name"
            />
            <TextField
                id={"type-description-textfield"}
                label={"Description"}
                value={typeDescription}
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
                autoComplete="type-description"
            />
            <TextField
                id={"type-class-textfield"}
                label={"Class"}
                value={typeClass}
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
                autoComplete="type-class"
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