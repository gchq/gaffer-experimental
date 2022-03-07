import React, { ReactElement } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@material-ui/core";
import { useImmerReducer } from "use-immer";
import ClearIcon from "@material-ui/icons/Clear";
import AddProperty from "./add-property";
import AddGroupby from "./add-groupby";
import sanitizeInputs, { isJSONString } from "../../util/sanitize-inputs";

interface IProps {
    onAddEdge(edge: object): void;

    types: Array<string>;
}

interface IState {
    edgeName: {
        value: string;
        hasErrors: boolean;
        message: string;
    };

    edgeDescription: {
        value: string;
        hasErrors: boolean;
        message: string;
    };

    edgeSource: {
        value: string;
    };

    edgeDestination: {
        value: string;
    };

    edgeDirected: {
        value: string;
    };
    properties: {
        properties: {};
        textarea: string;
        open: boolean;
        hasErrors: boolean;
    };
    groupBy: {
        groupBy: [];
        open: boolean;
        textarea: string;
        hasErrors: boolean;
    };
}

export default function AddEdge(props: IProps): ReactElement {
    const { onAddEdge, types } = props;

    function addEdgeSubmit() {
        const edgeToAdd: any = {};
        edgeToAdd[sanitizeInputs(state.edgeName.value)] = {
            description: sanitizeInputs(state.edgeDescription.value),
            source: sanitizeInputs(state.edgeSource.value),
            destination: sanitizeInputs(state.edgeDestination.value),
            directed: sanitizeInputs(state.edgeDirected.value),
        };
        if (Object.keys(state.properties.properties).length !== 0) {
            edgeToAdd[state.edgeName.value].properties = state.properties.properties;
        }
        if (state.groupBy.groupBy.length !== 0) {
            edgeToAdd[state.edgeName.value].groupBy = state.groupBy.groupBy;
        }
        onAddEdge(edgeToAdd);
        dispatch({ type: "reset" });
    }

    const initialState: IState = {
        edgeName: {
            value: "",
            hasErrors: false,
            message: "",
        },

        edgeDescription: {
            value: "",
            hasErrors: false,
            message: "",
        },

        edgeSource: {
            value: "",
        },

        edgeDestination: {
            value: "",
        },

        edgeDirected: {
            value: "",
        },
        properties: {
            properties: {},
            textarea: "",
            open: false,
            hasErrors: false,
        },
        groupBy: {
            groupBy: [],
            open: false,
            textarea: "",
            hasErrors: false,
        },
    };

    function addEdgeReducer(draft: any, action: any) {
        switch (action.type) {
            case "reset":
                return initialState;

            case "validateEdgeName":
                draft.edgeName.hasErrors = false;
                draft.edgeName.value = action.value;
                draft.edgeName.message = "";

                if (!/^[a-zA-Z]+$/.test(draft.edgeName.value)) {
                    draft.edgeName.hasErrors = true;
                    draft.edgeName.message = "Edge name can only contain letters";
                }
                return;

            case "validateEdgeDescription":
                draft.edgeDescription.hasErrors = false;
                draft.edgeDescription.value = action.value;
                draft.edgeDescription.message = "";

                if (draft.edgeDescription.value && !/^[a-zA-Z0-9\s]+$/.test(draft.edgeDescription.value)) {
                    draft.edgeDescription.hasErrors = true;
                    draft.edgeDescription.message =
                        "Edge description can only contain alpha numeric letters and spaces";
                }
                return;

            case "validateEdgeSource":
                draft.edgeSource.value = action.value;
                return;

            case "validateEdgeDestination":
                draft.edgeDestination.value = action.value;
                return;

            case "validateEdgeDirected":
                draft.edgeDirected.value = action.value;
                return;
            case "handleClickCloseProperties":
                draft.properties.open = action.value;
                return;
            case "handleUpdateProperties":
                draft.properties.properties[Object.keys(action.value)[0]] = Object.values(action.value)[0];
                return;
            case "handleUpdatePropertiesTextarea":
                if (isJSONString(action.value) || action.value === "") {
                    draft.properties.textarea = action.value;
                    draft.properties.hasErrors = false;
                    return;
                }
                draft.properties.hasErrors = true;
                draft.properties.textarea = action.value;
                return;
            case "handleClickCloseGroupby":
                draft.groupBy.open = action.value;
                return;
            case "handleUpdateGroupBy":
                if (!draft.groupBy.groupBy.includes(action.value)) {
                    draft.groupBy.groupBy[draft.groupBy.groupBy.length] = action.value;
                    return;
                }
                return;
            case "handleUpdateGroupByTextarea":
                const regex = new RegExp("[&@#/%?=~_|!:;()<>/|]");
                if (!regex.test(action.value) || action.value === "") {
                    draft.groupBy.hasErrors = false;
                    draft.groupBy.textarea = action.value;
                    return;
                }
                draft.groupBy.hasErrors = true;
                draft.groupBy.textarea = action.value;
                return;
        }
    }

    const [state, dispatch] = useImmerReducer(addEdgeReducer, initialState);

    function disableAddEdgeButton(): boolean {
        return (
            state.edgeName.value.length === 0 ||
            state.edgeName.hasErrors ||
            state.edgeDescription.value.length === 0 ||
            state.edgeDescription.hasErrors ||
            state.edgeSource.value.length === 0 ||
            state.edgeDestination.value.length === 0 ||
            state.edgeDirected.value.length === 0
        );
    }

    function closeProperties() {
        dispatch({ type: "handleClickCloseProperties", value: false });
    }

    function closeGroupBy() {
        dispatch({ type: "handleClickCloseGroupby", value: false });
    }

    return (
        <Grid container spacing={2} direction="column" id={"add-edge-inputs"}>
            <Grid item>
                <TextField
                    id={"edge-name-input"}
                    label={"Edge Name"}
                    aria-label="edge-name-input"
                    inputProps={{
                        name: "Edge Name",
                        id: "edge-name-input",
                        "aria-label": "edge-name-input",
                        maxLength: 20,
                    }}
                    name={"edge-name"}
                    value={state.edgeName.value}
                    variant="outlined"
                    fullWidth
                    error={state.edgeName.hasErrors}
                    required
                    onChange={(e) => dispatch({ type: "validateEdgeName", value: e.target.value })}
                    helperText={state.edgeName.message}
                />
            </Grid>
            <Grid item>
                <TextField
                    id={"edge-description-input"}
                    label={"Description"}
                    aria-label="edge-description-input"
                    inputProps={{
                        name: "Edge Description",
                        id: "edge-description-input",
                        "aria-label": "edge-description-input",
                        maxLength: 120,
                    }}
                    name={"edge-description"}
                    value={state.edgeDescription.value}
                    variant="outlined"
                    fullWidth
                    error={state.edgeDescription.hasErrors}
                    required
                    onChange={(e) => dispatch({ type: "validateEdgeDescription", value: e.target.value })}
                    helperText={state.edgeDescription.message}
                />
            </Grid>
            <Grid item>
                <FormControl variant="outlined" fullWidth id={"edge-source-formcontrol"}>
                    <InputLabel id="edge-source-select-label" required>
                        Source
                    </InputLabel>
                    <Select
                        labelId="edge-source-select-label"
                        id="edge-source-select"
                        label="Source"
                        value={state.edgeSource.value}
                        onChange={(e) => dispatch({ type: "validateEdgeSource", value: e.target.value })}
                    >
                        {types.map((type: string) => (
                            <MenuItem
                                key={type + "-item"}
                                value={type}
                                aria-label={type + "-menu-item"}
                                id={type + "-menu-item"}
                                aria-labelledby={"source-select-label"}
                            >
                                {type}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item>
                <FormControl variant="outlined" fullWidth id={"edge-destination-formcontrol"}>
                    <InputLabel id="edge-destination-select-label" required>
                        Destination
                    </InputLabel>
                    <Select
                        labelId="edge-destination-select-label"
                        id="edge-destination-select"
                        label="Destination"
                        value={state.edgeDestination.value}
                        onChange={(e) => dispatch({ type: "validateEdgeDestination", value: e.target.value })}
                    >
                        {types.map((type: string) => (
                            <MenuItem
                                key={type + "-item"}
                                value={type}
                                aria-label={type + "-menu-item"}
                                id={type + "-menu-item"}
                                aria-labelledby={"destination-select-label"}
                            >
                                {type}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item>
                <FormControl variant="outlined" fullWidth id={"edge-directed-formcontrol"}>
                    <InputLabel id="edge-directed-select-label" required>
                        Directed
                    </InputLabel>
                    <Select
                        labelId="edge-directed-select-label"
                        id="edge-directed-select"
                        label="Directed"
                        value={state.edgeDirected.value}
                        onChange={(e) => dispatch({ type: "validateEdgeDirected", value: e.target.value })}
                    >
                        <MenuItem value={"true"}>True</MenuItem>
                        <MenuItem value={"false"}>False</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            <Grid item>
                <Button
                    variant="outlined"
                    onClick={() => dispatch({ type: "handleClickCloseProperties", value: true })}
                    id={"add-properties-button"}
                >
                    Add Property
                </Button>
                <Dialog
                    fullWidth
                    maxWidth="xs"
                    open={state.properties.open}
                    onClose={closeProperties}
                    id={"add-properties-dialog"}
                    aria-labelledby="add-properties-dialog"
                >
                    <Box display="flex" alignItems="right" justifyContent="right">
                        <IconButton id="close-add-properties-button" onClick={closeProperties}>
                            <ClearIcon />
                        </IconButton>
                    </Box>

                    <Box display="flex" alignItems="center" justifyContent="center">
                        <DialogTitle id="add-properties-dialog-title">{"Add Property"}</DialogTitle>
                    </Box>
                    <DialogContent>
                        <AddProperty
                            onAddProperty={(properties) => {
                                dispatch({ type: "handleUpdateProperties", value: properties });
                                dispatch({
                                    type: "handleUpdatePropertiesTextarea",
                                    value: state.properties.textarea + JSON.stringify(properties),
                                });
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </Grid>
            <Grid item>
                <TextField
                    id={"edge-properties-input"}
                    inputProps={{
                        name: "Edge Properties",
                        id: "edge-properties-input",
                        "aria-label": "edge-properties-input",
                    }}
                    fullWidth
                    value={state.properties.textarea}
                    name={"edge-properties"}
                    label={"Properties"}
                    error={state.properties.hasErrors}
                    helperText={state.properties.hasErrors ? "Invalid JSON" : ""}
                    multiline
                    rows={5}
                    variant="outlined"
                    onChange={(e) => {
                        dispatch({ type: "handleUpdatePropertiesTextarea", value: e.target.value });
                        dispatch({ type: "handleUpdateProperties", value: JSON.parse(e.target.value) });
                    }}
                />
            </Grid>

            <Grid item>
                <Button
                    variant="outlined"
                    onClick={() => dispatch({ type: "handleClickCloseGroupby", value: true })}
                    id={"add-groupby-button"}
                >
                    Add Groupby
                </Button>
                <Dialog
                    fullWidth
                    maxWidth="xs"
                    open={state.groupBy.open}
                    onClose={closeGroupBy}
                    id={"add-groupby-dialog"}
                    aria-labelledby="add-groupby-dialog"
                >
                    <Box display="flex" alignItems="right" justifyContent="right">
                        <IconButton id="close-add-groupby-button" onClick={closeGroupBy}>
                            <ClearIcon />
                        </IconButton>
                    </Box>

                    <Box display="flex" alignItems="center" justifyContent="center">
                        <DialogTitle id="add-groupby-dialog-title">{"Add Groupby"}</DialogTitle>
                    </Box>
                    <DialogContent>
                        <AddGroupby
                            onAddGroupby={(groupBy) => {
                                dispatch({
                                    type: "handleUpdateGroupByTextarea",
                                    value: state.groupBy.textarea + JSON.stringify(groupBy) + ",",
                                });
                                dispatch({ type: "handleUpdateGroupBy", value: groupBy });
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </Grid>
            <Grid item>
                <TextField
                    id={"edge-groupby-input"}
                    inputProps={{
                        name: "Edge Group By",
                        id: "edge-groupby-input",
                        "aria-label": "edge-groupby-input",
                    }}
                    fullWidth
                    value={state.groupBy.textarea}
                    error={state.groupBy.hasErrors}
                    helperText={state.groupBy.hasErrors ? "Invalid input" : ""}
                    name={"edge-groupby"}
                    label={"Group By"}
                    multiline
                    rows={5}
                    variant="outlined"
                    onChange={(e) => {
                        dispatch({ type: "handleUpdateGroupByTextarea", value: e.target.value });
                        JSON.parse("[" + e.target.value + "]").forEach((item: string) => {
                            dispatch({ type: "handleUpdateGroupBy", value: item });
                        });
                    }}
                />
            </Grid>

            <Box display="flex" alignItems="center" justifyContent="center">
                <Button
                    id={"add-edge-button"}
                    name={"Add Edge"}
                    variant="outlined"
                    disabled={disableAddEdgeButton()}
                    onClick={addEdgeSubmit}
                >
                    Add Edge
                </Button>
            </Box>
        </Grid>
    );
}
