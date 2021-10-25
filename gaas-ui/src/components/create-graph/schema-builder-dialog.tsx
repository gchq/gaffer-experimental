import * as React from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,useMediaQuery } from "@material-ui/core";
import SchemaBuilder from "../schema-builder/schema-builder";


export default function SchemaBuilderDialog() {
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
                    <SchemaBuilder elementsSchema={{"entities":{},"edges":{}}} onCreateTypesSchema={() => {}} typesSchema={{}}/>
                </DialogContent>
            </Dialog>
        </div>
    );
}
