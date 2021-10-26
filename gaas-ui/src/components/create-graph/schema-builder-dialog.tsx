import * as React from "react";
import {Button, Dialog, DialogContent, DialogTitle} from "@material-ui/core";
import SchemaBuilder from "../schema-builder/schema-builder";
import {ITypesSchema} from "../../domain/types-schema";
import {IElementsSchema} from "../../domain/elements-schema";

interface IProps {
    onCreateSchema(schema: {
        types: ITypesSchema,
        elements: IElementsSchema
    }): void;

    typesSchema: ITypesSchema;
    elementsSchema: IElementsSchema;
}

export default function SchemaBuilderDialog(props: IProps) {
    const {onCreateSchema, typesSchema, elementsSchema} = props;
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Button variant="outlined" onClick={handleClickOpen} id={"schema-builder-button"}>
                Schema Builder
            </Button>
            <Dialog
                fullWidth={true}
                open={open}
                onClose={handleClose}
                id={"schema-builder-dialog"}
                aria-labelledby="schema-builder-dialog"
            >
                <DialogTitle id="schema-builder-dialog-title">
                    {"Schema Builder"}
                </DialogTitle>
                <DialogContent>
                    <SchemaBuilder elementsSchema={elementsSchema} onCreateSchema={(schema) => {
                        onCreateSchema(schema);
                    }} typesSchema={typesSchema}/>
                </DialogContent>
            </Dialog>
        </div>
    );
}
