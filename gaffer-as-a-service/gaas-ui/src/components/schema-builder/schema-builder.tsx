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

import React, { ReactElement } from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, IconButton } from "@material-ui/core";
import AddType from "./add-type";
import AddEdge from "./add-edge";
import AddEntity from "./add-entity";
import ReactJson from "react-json-view";
import ClearIcon from "@material-ui/icons/Clear";
import { useImmerReducer } from "use-immer";
import { IElementsSchema } from "../../domain/elements-schema";

interface IProps {
    onCreateSchema(schema: { types: object; elements: IElementsSchema }): void;

    typesSchema: object;
    elementsSchema: IElementsSchema;
}

interface IState {
    openTypes: boolean;
    openEdges: boolean;
    openEntities: boolean;
    types: {};
    elements: IElementsSchema;
}

export default function SchemaBuilder(props: IProps): ReactElement {
    const { onCreateSchema, typesSchema, elementsSchema } = props;

    const initialState: IState = {
        openTypes: false,
        openEdges: false,
        openEntities: false,
        types: typesSchema,
        elements: {
            edges: castElementsToIElements(elementsSchema).edges,
            entities: castElementsToIElements(elementsSchema).entities,
        },
    };

    function castElementsToIElements(elementsObject: object): IElementsSchema {
        return elementsObject as IElementsSchema;
    }

    function createSchemaSubmit() {
        onCreateSchema({
            types: state.types,
            elements: { edges: state.elements.edges, entities: state.elements.entities },
        });
        dispatch({ type: "reset" });
    }

    function addSchemaBuilderReducer(draft: any, action: any) {
        switch (action.type) {
            case "reset":
                return initialState;
            case "handleClickCloseTypes":
                draft.openTypes = action.value;
                return;

            case "handleClickCloseEdges":
                draft.openEdges = action.value;
                return;

            case "handleUpdateTypes":
                Object.assign(draft.types, action.value);
                return;
            case "handleDeleteTypes":
                draft.types = action.value;
                return;
            case "handleUpdateEdges":
                draft.elements.edges = Object.assign(draft.elements.edges, action.value);
                return;
            case "handleDeleteEdges":
                draft.elements.edges = action.value;
                return;

            case "handleUpdateEntities":
                draft.elements.entities = Object.assign(draft.elements.entities, action.value);
                return;
            case "handleDeleteEntities":
                draft.elements.entities = action.value;
                return;
            case "handleClickCloseEntities":
                draft.openEntities = action.value;
                return;
        }
    }

    function disableNonTypeButtons(): boolean {
        return Object.keys(state.types).length === 0;
    }

    const [state, dispatch] = useImmerReducer(addSchemaBuilderReducer, initialState);

    function closeTypes() {
        dispatch({ type: "handleClickCloseTypes", value: false });
    }

    function closeEdges() {
        dispatch({ type: "handleClickCloseEdges", value: false });
    }

    function closeEntities() {
        dispatch({ type: "handleClickCloseEntities", value: false });
    }

    return (
        <Grid container spacing={2} direction="column" id={"schema-builder-component"}>
            <Grid item container spacing={2} direction="row" alignItems="center" id={"add-schema-element-buttons"}>
                <Grid item>
                    <Button
                        data-testid="add-type-dialog-button"
                        variant="outlined"
                        onClick={() => dispatch({ type: "handleClickCloseTypes", value: true })}
                        id={"add-type-dialog-button"}
                    >
                        Add Type
                    </Button>
                    <Dialog
                        fullWidth
                        maxWidth="xs"
                        open={state.openTypes}
                        onClose={closeTypes}
                        id={"add-type-dialog"}
                        aria-labelledby="add-type-dialog"
                    >
                        <Box display="flex" alignItems="right" justifyContent="right">
                            <IconButton id="close-add-type-button" onClick={closeTypes}>
                                <ClearIcon />
                            </IconButton>
                        </Box>
                        <Box display="flex" alignItems="center" justifyContent="center">
                            <DialogTitle id="add-type-dialog-title">{"Add Type"}</DialogTitle>
                        </Box>

                        <DialogContent>
                            <AddType
                                onAddType={(typesObject) => dispatch({ type: "handleUpdateTypes", value: typesObject })}
                            />
                        </DialogContent>
                    </Dialog>
                </Grid>
                <Grid item>
                    <Button
                        data-testid="add-edge-dialog-button"
                        variant="outlined"
                        onClick={() => dispatch({ type: "handleClickCloseEdges", value: true })}
                        id={"add-edge-dialog-button"}
                        disabled={disableNonTypeButtons()}
                    >
                        Add Edge
                    </Button>
                    <Dialog
                        fullWidth
                        maxWidth="xs"
                        open={state.openEdges}
                        onClose={closeEdges}
                        id={"add-edge-dialog"}
                        aria-labelledby="add-edge-dialog"
                    >
                        <Box display="flex" alignItems="right" justifyContent="right">
                            <IconButton id="close-add-edge-button" onClick={closeEdges}>
                                <ClearIcon />
                            </IconButton>
                        </Box>

                        <Box display="flex" alignItems="center" justifyContent="center">
                            <DialogTitle id="add-edge-dialog-title">{"Add Edge"}</DialogTitle>
                        </Box>
                        <DialogContent>
                            <AddEdge
                                onAddEdge={(edgeObject) => dispatch({ type: "handleUpdateEdges", value: edgeObject })}
                                types={Object.keys(state.types)}
                            />
                        </DialogContent>
                    </Dialog>
                </Grid>
                <Grid item>
                    <Button
                        data-testid="add-entity-dialog-button"
                        variant="outlined"
                        onClick={() => dispatch({ type: "handleClickCloseEntities", value: true })}
                        id={"add-entity-dialog-button"}
                        disabled={disableNonTypeButtons()}
                    >
                        Add Entity
                    </Button>
                    <Dialog
                        fullWidth
                        maxWidth="xs"
                        open={state.openEntities}
                        onClose={closeEntities}
                        id={"add-entity-dialog"}
                        aria-labelledby="add-entity-dialog"
                    >
                        <Box display="flex" alignItems="right" justifyContent="right">
                            <IconButton id="close-add-entity-button" onClick={closeEntities}>
                                <ClearIcon />
                            </IconButton>
                        </Box>
                        <Box display="flex" alignItems="center" justifyContent="center">
                            <DialogTitle id="add-entity-dialog-title">{"Add Entity"}</DialogTitle>
                        </Box>
                        <DialogContent>
                            <AddEntity
                                onAddEntity={(entityObject) =>
                                    dispatch({ type: "handleUpdateEntities", value: entityObject })
                                }
                                types={Object.keys(state.types)}
                            />
                        </DialogContent>
                    </Dialog>
                </Grid>
            </Grid>
            <Grid item>
                <Grid id={"json-types-schema-viewer"}>
                    <ReactJson
                        src={state.types}
                        name={null}
                        theme="bright"
                        onEdit={(e) => {
                            dispatch({ type: "handleUpdateTypes", value: e.updated_src });
                        }}
                        onDelete={(e) => {
                            dispatch({ type: "handleDeleteTypes", value: e.updated_src });
                        }}
                        displayDataTypes={false}
                        displayObjectSize={false}
                        collapsed={false}
                    />
                </Grid>
                <Grid id={"json-entities-schema-viewer"}>
                    <ReactJson
                        src={state.elements.entities}
                        name={"entities"}
                        theme="bright"
                        onEdit={(e) => {
                            dispatch({ type: "handleUpdateEntities", value: e.updated_src });
                        }}
                        onDelete={(e) => {
                            dispatch({ type: "handleDeleteEntities", value: e.updated_src });
                        }}
                        displayDataTypes={false}
                        displayObjectSize={false}
                        collapsed={false}
                    />
                </Grid>
                <Grid id={"json-edges-schema-viewer"}>
                    <ReactJson
                        src={state.elements.edges}
                        name={"edges"}
                        theme="bright"
                        onEdit={(e) => {
                            dispatch({ type: "handleUpdateEdges", value: e.updated_src });
                        }}
                        onDelete={(e) => {
                            dispatch({ type: "handleDeleteEdges", value: e.updated_src });
                        }}
                        displayDataTypes={false}
                        displayObjectSize={false}
                        collapsed={false}
                    />
                </Grid>
            </Grid>
            <Box display="flex" alignItems="center" justifyContent="center">
                <Button
                    variant="outlined"
                    id={"create-schema-button"}
                    name={"Create Schema"}
                    onClick={createSchemaSubmit}
                    disabled={disableNonTypeButtons()}
                >
                    Create Schema
                </Button>
            </Box>
        </Grid>
    );
}
