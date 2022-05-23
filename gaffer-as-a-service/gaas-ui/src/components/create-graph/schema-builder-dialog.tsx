/*
 * Copyright 2021-2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton } from "@material-ui/core";
import SchemaBuilder from "../schema-builder/schema-builder";
import ClearIcon from "@material-ui/icons/Clear";
import { IElementsSchema } from "../../domain/elements-schema";

interface IProps {
    onCreateSchema(schema: { types: object; elements: IElementsSchema }): void;

    typesSchema: object;
    elementsSchema: IElementsSchema;
}

export default function SchemaBuilderDialog(props: IProps) {
    const { onCreateSchema, typesSchema, elementsSchema } = props;
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
                fullWidth
                maxWidth="md"
                open={open}
                onClose={handleClose}
                id={"schema-builder-dialog"}
                aria-labelledby="schema-builder-dialog"
            >
                <Box display="flex" alignItems="right" justifyContent="right">
                    <IconButton id="close-schema-builder-dialog-button" onClick={handleClose}>
                        <ClearIcon />
                    </IconButton>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="center">
                    <DialogTitle id="schema-builder-dialog-title">{"Schema Builder"}</DialogTitle>
                </Box>
                <DialogContent>
                    <SchemaBuilder
                        elementsSchema={elementsSchema}
                        onCreateSchema={(schema) => {
                            onCreateSchema(schema);
                        }}
                        typesSchema={typesSchema}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
