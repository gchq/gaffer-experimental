import React, { ReactElement } from "react";
import { Button, Grid, TextField, Box, IconButton, DialogTitle, DialogContent, Dialog } from "@material-ui/core";
import { useImmerReducer } from "use-immer";
import AddAggregateFunction from "./add-aggregate-function";
import ClearIcon from "@material-ui/icons/Clear";
import AddSerialiser from "./add-serialiser";
import { StarRateRounded } from "@material-ui/icons";
import { startsWith } from "core-js/library/es7/string";

interface IProps {
    onAddType(type: object): void;
}
interface IState {
    typeName: {
        value: string;
        hasErrors: boolean;
        message: string;
    };
    typeDescription: {
        value: string;
        hasErrors: boolean;
        message: string;
    };
    typeClass: {
        value: string;
        hasErrors: boolean;
        message: string;
    };
    aggregateFunction: {};
    openAggregateFunction: boolean;
    serialiser: {};
    openSerialiser: boolean;
}

export default function AddType(props: IProps): ReactElement {
    const { onAddType } = props;

    const initialState: IState = {
        typeName: {
            value: "",
            hasErrors: false,
            message: "",
        },

        typeDescription: {
            value: "",
            hasErrors: false,
            message: "",
        },

        typeClass: {
            value: "",
            hasErrors: false,
            message: "",
        },
        aggregateFunction: {},
        openAggregateFunction: false,
        serialiser: {},
        openSerialiser: false,
    };

    function addTypeReducer(draft: any, action: any) {
        switch (action.type) {
            case "reset":
                return initialState;

            case "validateTypeName":
                draft.typeName.hasErrors = false;
                draft.typeName.value = action.value;
                draft.typeName.message = "";

                if (!/^[a-zA-Z]*$/.test(draft.typeName.value)) {
                    draft.typeName.hasErrors = true;
                    draft.typeName.message = "Type name can only contain letters";
                }
                return;

            case "validateTypeDescription":
                draft.typeDescription.hasErrors = false;
                draft.typeDescription.value = action.value;
                draft.typeDescription.message = "";
                if (draft.typeDescription.value && !/^[\w\s.?_,'"-]*$/.test(draft.typeDescription.value)) {
                    draft.typeDescription.hasErrors = true;
                    draft.typeDescription.message =
                        "Type description can only contain alpha numeric letters and spaces";
                }
                return;

            case "validateTypeClass":
                draft.typeClass.hasErrors = false;
                draft.typeClass.value = action.value;
                draft.typeClass.message = "";
                if (draft.typeClass.value && !/^[a-zA-Z.]*$/.test(draft.typeClass.value)) {
                    draft.typeClass.hasErrors = true;
                    draft.typeClass.message = "Type class can only contain letters";
                }
                return;
            case "handleClickCloseAggregateFunction":
                draft.openAggregateFunction = action.value;
                return;
            case "validateTypeAggregateFunction":
                draft.aggregateFunction = action.value;
                return;
            case "handleUpdateAggregateFunction":
                draft.aggregateFunction[action.value.key] = action.value.value;
                return;
            case "handleClickCloseSerialiser":
                draft.openSerialiser = action.value;
                return;
            case "validateTypeSerialiser":
                draft.serialiser = action.value;
                return;
            case "handleUpdateSerialiser":
                draft.serialiser[action.value.key] = action.value.value;
                return;
        }
    }

    const [state, dispatch] = useImmerReducer(addTypeReducer, initialState);

    function disableAddTypeButton(): boolean {
        return (
            state.typeName.value.length === 0 ||
            state.typeName.hasErrors ||
            state.typeDescription.value.length === 0 ||
            state.typeDescription.hasErrors ||
            state.typeClass.value.length === 0 ||
            state.typeClass.hasErrors
        );
    }

    function addTypeSubmit() {
        const typeToAdd: any = {};
        typeToAdd[state.typeName.value] = {
            description: state.typeDescription.value,
            class: state.typeClass.value,
            aggregateFunction: state.aggregateFunction,
            serialiser: state.serialiser,
        };
        onAddType(typeToAdd);
        dispatch({ type: "reset" });
    }

    return (
        <Grid id={"add-type-component"}>
            <Grid container spacing={2} direction="column" id={"add-type-inputs"}>
                <Grid item>
                    <TextField
                        id={"type-name-input"}
                        label={"Type Name"}
                        value={state.typeName.value}
                        aria-label="type-name-input"
                        inputProps={{
                            name: "Type Name",
                            id: "type-name-input",
                            "aria-label": "type-name-input",
                        }}
                        variant="outlined"
                        fullWidth
                        error={state.typeName.hasErrors}
                        onChange={(e) => dispatch({ type: "validateTypeName", value: e.target.value })}
                        helperText={state.typeName.message}
                        name={"type-name"}
                        autoComplete="type-name"
                    />
                </Grid>
                <Grid item>
                    <TextField
                        id={"type-description-input"}
                        label={"Description"}
                        value={state.typeDescription.value}
                        aria-label="type-description-input"
                        inputProps={{
                            name: "Type Description",
                            id: "type-description-input",
                            "aria-label": "type-description-input",
                        }}
                        variant="outlined"
                        fullWidth
                        error={state.typeDescription.hasErrors}
                        onChange={(e) => dispatch({ type: "validateTypeDescription", value: e.target.value })}
                        helperText={state.typeDescription.message}
                        name={"type-description"}
                        autoComplete="type-description"
                    />
                </Grid>
                <Grid item>
                    <TextField
                        id={"type-class-input"}
                        label={"Class"}
                        value={state.typeClass.value}
                        aria-label="type-class-input"
                        inputProps={{
                            name: "Type Class",
                            id: "type-class-input",
                            "aria-label": "type-class-input",
                        }}
                        variant="outlined"
                        fullWidth
                        error={state.typeClass.hasErrors}
                        onChange={(e) => dispatch({ type: "validateTypeClass", value: e.target.value })}
                        helperText={state.typeClass.message}
                        name={"type-class"}
                        autoComplete="type-class"
                    />
                </Grid>
                <Grid item>
                    <Button
                        variant="outlined"
                        onClick={(e) => dispatch({ type: "handleClickCloseAggregateFunction", value: true })}
                        id={"add-aggregate-function-button"}
                    >
                        Add Aggregate Function
                    </Button>
                    <Dialog
                        fullWidth
                        maxWidth="xs"
                        open={state.openAggregateFunction}
                        onClose={(e) => dispatch({ type: "handleClickCloseAggregateFunction", value: false })}
                        id={"add-aggregate-function-dialog"}
                        aria-labelledby="add-aggregate-function-dialog"
                    >
                        <Box display="flex" alignItems="right" justifyContent="right">
                            <IconButton
                                id="close-add-groupby-button"
                                onClick={(e) => dispatch({ type: "handleClickCloseAggregateFunction", value: false })}
                            >
                                <ClearIcon />
                            </IconButton>
                        </Box>

                        <Box display="flex" alignItems="center" justifyContent="center">
                            <DialogTitle id="add-aggregate-function-dialog-title">
                                {"Add Aggregate Function"}
                            </DialogTitle>
                        </Box>
                        <DialogContent>
                            <AddAggregateFunction
                                onAddAggregateFunction={(aggregateFunction) =>
                                    dispatch({ type: "handleUpdateAggregateFunction", value: aggregateFunction })
                                }
                            />
                        </DialogContent>
                    </Dialog>
                </Grid>
                <Grid item>
                    <TextField
                        id={"type-aggregate-function-input"}
                        inputProps={{
                            name: "Type Aggregate Function",
                            id: "type-aggregate-function-input",
                            "aria-label": "type-aggregate-function-input",
                        }}
                        fullWidth
                        value={JSON.stringify(state.aggregateFunction)}
                        name={"type-aggregate-function"}
                        required
                        multiline
                        rows={5}
                        variant="outlined"
                        onChange={(e) => dispatch({ type: "validateTypeAggregateFunction", value: e.target.value })}
                    />
                </Grid>
                <Grid item>
                    <Button
                        variant="outlined"
                        onClick={(e) => dispatch({ type: "handleClickCloseSerialiser", value: true })}
                        id={"add-serialiser-button"}
                    >
                        Add Serialiser
                    </Button>
                    <Dialog
                        fullWidth
                        maxWidth="xs"
                        open={state.openSerialiser}
                        onClose={(e) => dispatch({ type: "handleClickCloseSerialiser", value: false })}
                        id={"add-serialiser-dialog"}
                        aria-labelledby="add-serialiser-dialog"
                    >
                        <Box display="flex" alignItems="right" justifyContent="right">
                            <IconButton
                                id="close-serialiser-button"
                                onClick={(e) => dispatch({ type: "handleClickCloseSerialiser", value: false })}
                            >
                                <ClearIcon />
                            </IconButton>
                        </Box>

                        <Box display="flex" alignItems="center" justifyContent="center">
                            <DialogTitle id="add-serialiser-dialog-title">{"Add Serialiser"}</DialogTitle>
                        </Box>
                        <DialogContent>
                            <AddSerialiser
                                onAddSerialiser={(serialiser) =>
                                    dispatch({ type: "handleUpdateSerialiser", value: serialiser })
                                }
                            />
                        </DialogContent>
                    </Dialog>
                </Grid>
                <Grid item>
                    <TextField
                        id={"type-serialiser-input"}
                        inputProps={{
                            name: "Type Serialiser",
                            id: "type-serialiser-input",
                            "aria-label": "type-serialiser-input",
                        }}
                        fullWidth
                        value={JSON.stringify(state.serialiser)}
                        name={"type-serialiser-textfield"}
                        required
                        multiline
                        rows={5}
                        variant="outlined"
                        onChange={(e) => dispatch({ type: "validateTypeSerialiser", value: e.target.value })}
                    />
                </Grid>
                <Box display="flex" alignItems="center" justifyContent="center">
                    <Button
                        variant="outlined"
                        id={"add-type-button"}
                        name={"Add Type"}
                        disabled={disableAddTypeButton()}
                        onClick={addTypeSubmit}
                    >
                        Add Type
                    </Button>
                </Box>
            </Grid>
        </Grid>
    );
}
