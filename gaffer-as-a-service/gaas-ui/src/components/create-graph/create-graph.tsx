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

import {
    Box,
    Button,
    Container,
    CssBaseline,
    Dialog,
    DialogContent,
    Grid,
    IconButton,
    makeStyles,
    Slide,
    Toolbar,
    Tooltip,
    Typography,
    Zoom,
} from "@material-ui/core";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import AddRoundedIcon from "@material-ui/icons/AddRounded";
import React, { useState, useEffect } from "react";
import { CreateStoreTypesGraphRepo, ICreateGraphConfig } from "../../rest/repositories/create-storetypes-graph-repo";
import { AlertType, NotificationAlert } from "../alerts/notification-alert";
import { GetAllGraphsRepo } from "../../rest/repositories/get-all-graphs-repo";
import { Graph } from "../../domain/graph";
import { ElementsSchema, IElementsSchema } from "../../domain/elements-schema";
import { TypesSchema } from "../../domain/types-schema";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import ClearIcon from "@material-ui/icons/Clear";
import { DropzoneArea } from "material-ui-dropzone";
import { TransitionProps } from "@material-ui/core/transitions";
import GraphIdDescriptionInput from "./graph-id-description";
import SchemaInput from "./schema-inputs";
import StoreTypeSelect from "./storetype-select";
import AddProxyGraphInput from "./add-proxy-graph-input";
import ProxyGraphsTable from "./proxy-graphs-table";
import { GetStoreTypesRepo, IStoreTypes } from "../../rest/repositories/get-store-types-repo";
import { CreateFederatedGraphRepo } from "../../rest/repositories/create-federated-graph-repo";
import { Copyright } from "../copyright/copyright";
import SchemaBuilderDialog from "./schema-builder-dialog";
import { GaaSAPIErrorResponse } from "../../rest/http-message-interfaces/error-response-interface";
import DOMPurify from "dompurify";
import { encode } from "html-entities";
import GraphLifetimeInDaysSelect from "./graph-lifetime-in-days-select";
import { useLocation } from "react-router-dom";
import { GraphType } from "../../domain/graph-type";

const Transition = React.forwardRef((props: TransitionProps & { children?: React.ReactElement<any, any> }) => (
    <Slide direction="up" {...props} />
));

//export default class CreateGraph extends React.Component<{}, IState> {

export default function CreateGraph(props: any) {
    const location: any = useLocation();
    const [existinGraphId, setExistinGraphId] = useState(location.state.graphId);
    const [graphId, setGraphId] = useState("");
    const [graphIdIsValid, setGraphIdIsValid] = useState(false);
    const [description, setDescription] = useState("");
    const [graphDescriptionIsValid, setGraphDescriptionIsValid] = useState(false);
    const [schemaJson, setSchemaJson] = useState("");
    const [elements, setElements] = useState("");
    const [elementsFiles, setElementsFiles] = useState<File[]>([]);
    const [elementsFieldDisabled, setElementsFieldDisabled] = useState(false);
    const [types, setTypes] = useState("");
    const [typesFiles, setTypesFiles] = useState<File[]>([]);
    const [typesFieldDisabled, setTypesFieldDisabled] = useState(false);
    const [dialogIsOpen, setDialogIsOpen] = useState(false);
    const [storeType, setStoreType] = useState("");
    const [storeTypes, setStoreTypes] = useState<string[]>([]);
    const [federatedStoreTypes, setFederatedStoreTypes] = useState<string[]>([]);
    const [graphs, setGraphs] = useState([new Graph("", "", "", "", "DOWN", "", "", GraphType.GAAS_GRAPH)]);
    const [proxyURL, setProxyURL] = useState("");
    const [root, setRoot] = useState("");
    const [selectedGraphs, setSelectedGraphs] = useState<string[]>([]);
    const [outcome, setOutcome] = React.useState<AlertType | undefined>();
    const [outcomeMessage, setOutcomeMessage] = useState("");
    const [graphLifetimeInDays, setGraphLifetimeInDays] = useState("");

    // constructor(props: object) {
    //     super(props);

    // }

    useEffect(() => {
        getGraphs();
        getAllStoreTypes();
    }, []);

    const getGraphs = async () => {
        try {
            const graphs: Graph[] = await new GetAllGraphsRepo().getAll();
            setGraphs(graphs);
        } catch (e: any) {
            setOutcome(AlertType.FAILED);
            setOutcomeMessage(
                `Failed to get all graphs. ${(e as GaaSAPIErrorResponse).title}: ${(e as GaaSAPIErrorResponse).detail}`
            );
        }
    };

    const getAllStoreTypes = async () => {
        try {
            const storeTypes: IStoreTypes = await new GetStoreTypesRepo().get();
            setStoreTypes(storeTypes.storeTypes);
            setFederatedStoreTypes(storeTypes.federatedStoreTypes);
        } catch (e: any) {
            setOutcome(AlertType.FAILED);
            setOutcomeMessage(
                `Storetypes unavailable: ${(e as GaaSAPIErrorResponse).title}: ${(e as GaaSAPIErrorResponse).detail}`
            );
        }
    };

    const submitNewGraph = async () => {
        //TODO: separate functions
        setGraphId(graphId);
        setDescription(description);
        setStoreType(storeType);
        setGraphs(graphs);
        setSelectedGraphs(selectedGraphs);
        setGraphLifetimeInDays(graphLifetimeInDays);

        let config: ICreateGraphConfig;
        if (currentStoreTypeIsFederated()) {
            const subGraphs: Array<{ graphId: string; host: string; root: string }> = graphs
                .filter((graph) => selectedGraphs.includes(graph.getId()))
                .map((subGraph: Graph) => ({
                    graphId: subGraph.getId(),
                    host: subGraph.getGraphHost(),
                    root: "/rest",
                }));
            config = { proxySubGraphs: subGraphs };
        } else {
            const newElements = new ElementsSchema(elements);
            const newTypes = new TypesSchema(types);
            newElements.validate();
            newTypes.validate();
            config = {
                schema: {
                    entities: newElements.getEntities(),
                    edges: newElements.getEdges(),
                    types: newTypes.getTypes(),
                },
            };
        }

        try {
            if (!currentStoreTypeIsFederated()) {
                await new CreateStoreTypesGraphRepo().create(
                    encode(DOMPurify.sanitize(graphId)),
                    encode(DOMPurify.sanitize(description)),
                    storeType,
                    graphLifetimeInDays,
                    config
                );
            } else {
                await new CreateFederatedGraphRepo().create(
                    encode(DOMPurify.sanitize(graphId)),
                    encode(DOMPurify.sanitize(description)),
                    storeType,
                    graphLifetimeInDays,
                    config
                );
            }
            setOutcome(AlertType.SUCCESS);
            setOutcomeMessage(`${graphId} was successfully added`);
            resetForm();
        } catch (e: any) {
            setOutcome(AlertType.FAILED);
            setOutcomeMessage(
                `Failed to Add '${graphId}' Graph. ${(e as GaaSAPIErrorResponse).title}: ${
                    (e as GaaSAPIErrorResponse).detail
                }`
            );
        }
    };

    const resetForm = () => {
        setGraphId("");
        setDescription("");
        setElementsFiles([]);
        setTypesFiles([]);
        setSchemaJson("");
        setElements("");
        setTypes("");
        setProxyURL("");
        setSelectedGraphs([]);
    };

    const uploadElementsFiles = async (elementsFiles: File[]) => {
        setElementsFiles(elementsFiles);
        if (elementsFiles.length > 0) {
            const elementsSchemaFiles = await elementsFiles[0].text();
            setElements(elementsSchemaFiles);
            setElementsFieldDisabled(true);
        } else {
            setElementsFieldDisabled(false);
        }
    };

    const uploadTypesFiles = async (typesFiles: File[]) => {
        setTypesFiles(elementsFiles);
        if (typesFiles.length > 0) {
            const typesSchemaFiles = await typesFiles[0].text();
            setTypes(typesSchemaFiles);
            setTypesFieldDisabled(true);
        } else {
            setTypesFieldDisabled(false);
        }
    };

    const disableSubmitButton = () => {
        setGraphId(graphId);
        setDescription(description);
        setGraphIdIsValid(graphIdIsValid);
        setGraphDescriptionIsValid(graphDescriptionIsValid);
        setElements(elements);
        setTypes(types);

        return (
            (!currentStoreTypeIsFederated() && (!elements || !types)) ||
            !graphId ||
            !description ||
            !graphIdIsValid ||
            !graphDescriptionIsValid ||
            (currentStoreTypeIsFederated() && selectedGraphs.length === 0) ||
            (!currentStoreTypeIsFederated() && !new ElementsSchema(elements).validate().isEmpty()) ||
            (!currentStoreTypeIsFederated() && !new TypesSchema(types).validate().isEmpty())
        );
    };

    const currentStoreTypeIsFederated = () => federatedStoreTypes.includes(storeType);

    const createElementsSchema = () => {
        let elementsSchema: IElementsSchema = { entities: {}, edges: {} };
        try {
            if (elements.length !== 0) {
                elementsSchema = JSON.parse(elements);
            }
        } catch (error) {}
        return elementsSchema;
    };

    const createTypesSchema = () => {
        let typesSchema: object = {};
        try {
            if (types.length !== 0) {
                typesSchema = JSON.parse(types);
            }
        } catch (error) {}
        return typesSchema;
    };

    // public render() {
    const federatedStoreIsNotSelected = (): boolean => !currentStoreTypeIsFederated();
    const openDialogBox = () => {
        setDialogIsOpen(true);
    };
    const closeDialogBox = () => {
        setDialogIsOpen(false);
    };

    return (
        <main aria-label="create-graph-Page" id={"create-graph-page"}>
            {outcome && <NotificationAlert alertType={outcome} message={outcomeMessage} />}
            <Toolbar />

            <Grid container justify="center">
                <Container maxWidth="md">
                    <CssBaseline />
                    <div className={classes.paper}>
                        <Grid
                            item
                            xs={12}
                            container
                            direction="row"
                            justify="center"
                            alignItems="center"
                            style={{ margin: 10 }}
                        >
                            <Box my={4}>
                                <Typography
                                    variant="h4"
                                    align={"center"}
                                    id={"create-graph-title"}
                                    aria-label={"create-graph-title"}
                                >
                                    Create Graph
                                </Typography>
                            </Box>
                        </Grid>
                        <form className={classes.form} noValidate>
                            <Grid container spacing={2}>
                                <GraphIdDescriptionInput
                                    graphIdValue={graphId}
                                    onChangeGraphId={(graphId, graphIdIsValid) =>
                                        this.setState({ graphId, graphIdIsValid })
                                    }
                                    descriptionValue={description}
                                    onChangeDescription={(description, graphDescriptionIsValid) =>
                                        this.setState({ description, graphDescriptionIsValid })
                                    }
                                />
                                <Grid item xs={12} container direction="row" justify="flex-end" alignItems="center" />
                                <StoreTypeSelect
                                    aria-label="store-type-select"
                                    allStoreTypes={storeTypes.concat(federatedStoreTypes)}
                                    value={storeType}
                                    onChangeStoreType={(storeType) => {
                                        setStoreType(storeType);
                                    }}
                                />
                                <GraphLifetimeInDaysSelect
                                    value={graphLifetimeInDays}
                                    onChangeGraphLifetimeInDays={(graphLifetimeInDays) => {
                                        setGraphLifetimeInDays(graphLifetimeInDays);
                                    }}
                                />
                                {federatedStoreIsNotSelected() && (
                                    <>
                                        <Grid
                                            item
                                            xs={12}
                                            container
                                            direction="row"
                                            justify="flex-end"
                                            alignItems="center"
                                            id={"test"}
                                        >
                                            <Tooltip TransitionComponent={Zoom} title="Use Schema builder">
                                                <SchemaBuilderDialog
                                                    typesSchema={createTypesSchema()}
                                                    elementsSchema={createElementsSchema()}
                                                    onCreateSchema={(schema) => {
                                                        setElements(JSON.stringify(schema.elements));
                                                        setTypes(JSON.stringify(schema.types));
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip
                                                TransitionComponent={Zoom}
                                                title="Add Empty Elements and Types Schema Templates"
                                            >
                                                <IconButton
                                                    onClick={() => {
                                                        setElements('{"entities":{}, "edges":{}}');
                                                        setTypes("{}");
                                                    }}
                                                >
                                                    <AddRoundedIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip
                                                TransitionComponent={Zoom}
                                                title="Add Elements and Types Schemas From File"
                                            >
                                                <IconButton id="attach-file-button" onClick={openDialogBox}>
                                                    <AttachFileIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip TransitionComponent={Zoom} title="Clear All Schemas">
                                                <IconButton
                                                    onClick={() => {
                                                        setElements("");
                                                        setTypes("");
                                                        setElementsFiles([]);
                                                        setTypes("");
                                                    }}
                                                >
                                                    <ClearIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Dialog
                                                id="dropzone"
                                                open={this.state.dialogIsOpen}
                                                TransitionComponent={Transition}
                                                keepMounted
                                                onClose={closeDialogBox}
                                                style={{ minWidth: "500px" }}
                                                aria-labelledby="alert-dialog-slide-title"
                                                aria-describedby="alert-dialog-slide-description"
                                            >
                                                <Grid
                                                    container
                                                    direction="row"
                                                    justify="flex-end"
                                                    alignItems="flex-start"
                                                >
                                                    <IconButton id="close-dropzone-button" onClick={closeDialogBox}>
                                                        <ClearIcon />
                                                    </IconButton>
                                                </Grid>

                                                <DialogContent>
                                                    <Grid id="elements-drop-zone">
                                                        <DropzoneArea
                                                            showPreviews={true}
                                                            onChange={async (files) => this.uploadElementsFiles(files)}
                                                            showPreviewsInDropzone={false}
                                                            dropzoneText="Drag and drop elements.JSON"
                                                            useChipsForPreview
                                                            previewGridProps={{
                                                                container: { spacing: 1, direction: "row" },
                                                            }}
                                                            previewChipProps={{
                                                                classes: { root: classes.previewChip },
                                                            }}
                                                            previewText="Selected files"
                                                            clearOnUnmount={true}
                                                            acceptedFiles={["application/json"]}
                                                            filesLimit={1}
                                                        />
                                                    </Grid>
                                                    <Grid id="types-drop-zone">
                                                        <DropzoneArea
                                                            showPreviews={true}
                                                            onChange={async (files) => this.uploadTypesFiles(files)}
                                                            showPreviewsInDropzone={false}
                                                            dropzoneText="Drag and drop types.JSON"
                                                            useChipsForPreview
                                                            previewGridProps={{
                                                                container: { spacing: 1, direction: "row" },
                                                            }}
                                                            previewChipProps={{
                                                                classes: { root: classes.previewChip },
                                                            }}
                                                            previewText="Selected files"
                                                            clearOnUnmount={true}
                                                            acceptedFiles={["application/json"]}
                                                            filesLimit={1}
                                                        />
                                                    </Grid>
                                                </DialogContent>
                                            </Dialog>
                                        </Grid>
                                    </>
                                )}
                                <SchemaInput
                                    hide={!federatedStoreIsNotSelected()}
                                    elementsValue={elements}
                                    onChangeElementsSchema={(elements) => setElements(elements)}
                                    typesSchemaValue={types}
                                    onChangeTypesSchema={(types) => setTypes(types)}
                                />
                                <Grid item xs={12} container direction="row" justify="flex-end" alignItems="center" />
                            </Grid>
                        </form>

                        <AddProxyGraphInput
                            hide={federatedStoreIsNotSelected()}
                            proxyURLValue={proxyURL}
                            onChangeProxyURL={(proxyURL) => setProxyURL(proxyURL)}
                            onClickAddProxyGraph={(proxyGraph) =>
                                this.setState({
                                    graphs: [...this.state.graphs, proxyGraph],
                                    selectedGraphs: [...this.state.selectedGraphs, proxyGraph.getId()],
                                })
                            }
                        />
                        <ProxyGraphsTable
                            hide={federatedStoreIsNotSelected()}
                            graphs={graphs}
                            selectedGraphs={selectedGraphs}
                            onClickCheckbox={(selectedGraphs) => setSelectedGraphs(selectedGraphs)}
                        />
                    </div>
                </Container>
                <Grid container style={{ margin: 10 }} direction="row" justify="center" alignItems="center">
                    <Button
                        id="create-new-graph-button"
                        onClick={() => {
                            submitNewGraph();
                        }}
                        startIcon={<AddCircleOutlineOutlinedIcon />}
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        disabled={disableSubmitButton()}
                    >
                        Create Graph
                    </Button>
                </Grid>
                <Box pt={4}>
                    <Copyright />
                </Box>
            </Grid>
        </main>
    );
}

const classes: any = makeStyles((theme) => ({
    root: {
        width: "100%",
        marginTop: 40,
    },
    paper: {
        marginTop: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    button: {
        margin: "10px",
    },
    previewChip: {
        minWidth: 160,
        maxWidth: 210,
    },
}));
