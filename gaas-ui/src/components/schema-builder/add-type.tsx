import React, { ReactElement } from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, TextField } from "@material-ui/core";
import { useImmerReducer } from "use-immer";
import AddAggregateFunction from "./add-aggregate-function";
import ClearIcon from "@material-ui/icons/Clear";
import AddSerialiser from "./add-serialiser";
import AddValidateFunctions from "./add-validate-functions";
import { isJSONString } from "../../util/util";
import DOMPurify from "dompurify";

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
    aggregateFunction: {
        aggregateFunction: {};
        open: boolean;
        textarea: string;
        hasErrors: boolean;
    };
    serialiser: {
        serialiser: {};
        open: boolean;
        textarea: string;
        hasErrors: boolean;
    };
    validateFunctions: {
        validateFunctions: [];
        open: boolean;
        textarea: string;
        hasErrors: boolean;
    };
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
        aggregateFunction: {
            aggregateFunction: {},
            open: false,
            textarea: "",
            hasErrors: false,
        },
        serialiser: {
            serialiser: {},
            open: false,
            textarea: "",
            hasErrors: false,
        },
        validateFunctions: {
            validateFunctions: [],
            open: false,
            textarea: "",
            hasErrors: false,
        },
    };

    function addTypeReducer(draft: any, action: any) {
        switch (action.type) {
            case "reset":
                return initialState;

            case "validateTypeName":
                draft.typeName.hasErrors = false;
                draft.typeName.value = action.value;
                draft.typeName.message = "";

                if (!/^[a-zA-Z]+$/.test(draft.typeName.value)) {
                    draft.typeName.hasErrors = true;
                    draft.typeName.message = "Type name can only contain letters";
                }
                return;

            case "validateTypeDescription":
                draft.typeDescription.hasErrors = false;
                draft.typeDescription.value = action.value;
                draft.typeDescription.message = "";
                if (draft.typeDescription.value && !/^[a-zA-Z0-9\s]+$/.test(draft.typeDescription.value)) {
                    draft.typeDescription.hasErrors = true;
                    draft.typeDescription.message =
                        "Type description can only contain alpha numeric letters and spaces";
                }
                return;

            case "validateTypeClass":
                draft.typeClass.hasErrors = false;
                draft.typeClass.value = action.value;
                draft.typeClass.message = "";
                if (draft.typeClass.value && !/^[a-zA-Z.]+$/.test(draft.typeClass.value)) {
                    draft.typeClass.hasErrors = true;
                    draft.typeClass.message = "Type class can only contain letters and .";
                }
                return;
            case "handleUpdateSerialiserTextarea":
                if (isJSONString(action.value) || action.value === "") {
                    draft.serialiser.textarea = action.value;
                    draft.serialiser.hasErrors = false;
                    return;
                }
                draft.serialiser.textarea = action.value;
                draft.serialiser.hasErrors = true;
                return;

            case "handleUpdateAggregateFunctionTextarea":
                if (isJSONString(action.value) || action.value === "") {
                    draft.aggregateFunction.textarea = action.value;
                    draft.aggregateFunction.hasErrors = false;
                    return;
                }
                draft.aggregateFunction.textarea = action.value;
                draft.aggregateFunction.hasErrors = true;
                return;

            case "handleUpdateValidateFunctionsTextarea":
                if (isJSONString(action.value) || action.value === "") {
                    draft.validateFunctions.textarea = action.value;
                    draft.validateFunctions.hasErrors = false;
                    return;
                }
                draft.validateFunctions.hasErrors = true;
                draft.validateFunctions.textarea = action.value;
                return;
            case "handleClickCloseAggregateFunction":
                draft.aggregateFunction.open = action.value;
                return;
            case "handleUpdateAggregateFunction":
                draft.aggregateFunction.aggregateFunction = action.value;
                return;
            case "handleClickCloseSerialiser":
                draft.serialiser.open = action.value;
                return;
            case "handleUpdateSerialiser":
                draft.serialiser.serialiser = action.value;
                return;
            case "handleClickCloseValidateFunctions":
                draft.validateFunctions.open = action.value;
                return;
            case "handleUpdateValidateFunctions":
                draft.validateFunctions.validateFunctions[draft.validateFunctions.validateFunctions.length] =
                    action.value;
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
        typeToAdd[DOMPurify.sanitize(state.typeName.value)] = {
            description: DOMPurify.sanitize(state.typeDescription.value),
            class: DOMPurify.sanitize(state.typeClass.value),
        };
        if (Object.keys(state.aggregateFunction.aggregateFunction).length !== 0) {
            typeToAdd[state.typeName.value].aggregateFunction = state.aggregateFunction.aggregateFunction;
        }
        if (Object.keys(state.serialiser.serialiser).length !== 0) {
            typeToAdd[state.typeName.value].serialiser = state.serialiser.serialiser;
        }
        if (state.validateFunctions.validateFunctions.length !== 0) {
            typeToAdd[state.typeName.value].validateFunctions = state.validateFunctions.validateFunctions;
        }
        onAddType(typeToAdd);
        dispatch({ type: "reset" });
    }

    function closeAggregateFunction() {
        dispatch({ type: "handleClickCloseAggregateFunction", value: false });
    }

    function closeSerialiser() {
        dispatch({ type: "handleClickCloseSerialiser", value: false });
    }

    function closeValidateFunctions() {
        dispatch({ type: "handleClickCloseValidateFunctions", value: false });
    }

    return (
        <Grid id={"add-type-component"}>
            <Grid container spacing={2} direction="column" id={"add-type-inputs"}>
                <Grid item>
                    <TextField
                        required
                        id={"type-name-input"}
                        label={"Type Name"}
                        value={state.typeName.value}
                        aria-label="type-name-input"
                        inputProps={{
                            name: "Type Name",
                            id: "type-name-input",
                            "aria-label": "type-name-input",
                            maxLength: 20,
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
                        required
                        id={"type-description-input"}
                        label={"Description"}
                        value={state.typeDescription.value}
                        aria-label="type-description-input"
                        inputProps={{
                            name: "Type Description",
                            id: "type-description-input",
                            "aria-label": "type-description-input",
                            maxLength: 120,
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
                        required
                        id={"type-class-input"}
                        label={"Class"}
                        value={state.typeClass.value}
                        aria-label="type-class-input"
                        inputProps={{
                            name: "Type Class",
                            id: "type-class-input",
                            "aria-label": "type-class-input",
                            maxLength: 30,
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
                        onClick={() => dispatch({ type: "handleClickCloseAggregateFunction", value: true })}
                        id={"add-aggregate-function-button"}
                    >
                        Add Aggregate Function
                    </Button>
                    <Dialog
                        fullWidth
                        maxWidth="xs"
                        open={state.aggregateFunction.open}
                        onClose={closeAggregateFunction}
                        id={"add-aggregate-function-dialog"}
                        aria-labelledby="add-aggregate-function-dialog"
                    >
                        <Box display="flex" alignItems="right" justifyContent="right">
                            <IconButton id="close-add-aggregate-function-button" onClick={closeAggregateFunction}>
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
                                onAddAggregateFunction={(aggregateFunction) => {
                                    dispatch({ type: "handleUpdateAggregateFunction", value: aggregateFunction });
                                    dispatch({
                                        type: "handleUpdateAggregateFunctionTextarea",
                                        value: JSON.stringify(aggregateFunction),
                                    });
                                }}
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
                        value={state.aggregateFunction.textarea}
                        error={state.aggregateFunction.hasErrors}
                        helperText={state.aggregateFunction.hasErrors ? "Invalid JSON" : ""}
                        name={"type-aggregate-function"}
                        label={"Aggregate Function"}
                        multiline
                        rows={5}
                        variant="outlined"
                        onChange={(e) => {
                            dispatch({ type: "handleUpdateAggregateFunctionTextarea", value: e.target.value });
                            dispatch({ type: "handleUpdateAggregateFunction", value: JSON.parse(e.target.value) });
                        }}
                    />
                </Grid>
                <Grid item>
                    <Button
                        variant="outlined"
                        onClick={() => dispatch({ type: "handleClickCloseSerialiser", value: true })}
                        id={"add-serialiser-button"}
                    >
                        Add Serialiser
                    </Button>
                    <Dialog
                        fullWidth
                        maxWidth="xs"
                        open={state.serialiser.open}
                        onClose={closeSerialiser}
                        id={"add-serialiser-dialog"}
                        aria-labelledby="add-serialiser-dialog"
                    >
                        <Box display="flex" alignItems="right" justifyContent="right">
                            <IconButton id="close-serialiser-button" onClick={closeSerialiser}>
                                <ClearIcon />
                            </IconButton>
                        </Box>

                        <Box display="flex" alignItems="center" justifyContent="center">
                            <DialogTitle id="add-serialiser-dialog-title">{"Add Serialiser"}</DialogTitle>
                        </Box>
                        <DialogContent>
                            <AddSerialiser
                                onAddSerialiser={(serialiser) => {
                                    dispatch({ type: "handleUpdateSerialiser", value: serialiser });
                                    dispatch({
                                        type: "handleUpdateSerialiserTextarea",
                                        value: JSON.stringify(serialiser),
                                    });
                                }}
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
                        value={state.serialiser.textarea}
                        name={"type-serialiser-textfield"}
                        error={state.serialiser.hasErrors}
                        helperText={state.serialiser.hasErrors ? "Invalid JSON" : ""}
                        label={"Serialiser"}
                        multiline
                        rows={5}
                        variant="outlined"
                        onChange={(e) => {
                            dispatch({ type: "handleUpdateSerialiserTextarea", value: e.target.value });
                            dispatch({ type: "handleUpdateSerialiser", value: JSON.parse(e.target.value) });
                        }}
                    />
                </Grid>
                <Grid item>
                    <Button
                        variant="outlined"
                        onClick={() => dispatch({ type: "handleClickCloseValidateFunctions", value: true })}
                        id={"add-validate-function-button"}
                    >
                        Add Validate Function
                    </Button>
                    <Dialog
                        fullWidth
                        maxWidth="xs"
                        open={state.validateFunctions.open}
                        onClose={closeValidateFunctions}
                        id={"add-validate-functions-dialog"}
                        aria-labelledby="add-validate-functions-dialog"
                    >
                        <Box display="flex" alignItems="right" justifyContent="right">
                            <IconButton id="close-validate-functions-button" onClick={closeValidateFunctions}>
                                <ClearIcon />
                            </IconButton>
                        </Box>

                        <Box display="flex" alignItems="center" justifyContent="center">
                            <DialogTitle id="add-validate-functions-dialog-title">
                                {"Add Validate Functions"}
                            </DialogTitle>
                        </Box>
                        <DialogContent>
                            <AddValidateFunctions
                                onAddValidateFunctions={(validateFunctions) => {
                                    dispatch({
                                        type: "handleUpdateValidateFunctionsTextarea",
                                        value: state.validateFunctions.textarea + JSON.stringify(validateFunctions),
                                    });
                                    dispatch({
                                        type: "handleUpdateValidateFunctions",
                                        value: validateFunctions,
                                    });
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </Grid>
                <Grid item>
                    <TextField
                        id={"type-validate-functions-input"}
                        inputProps={{
                            name: "Type Validate Functions",
                            id: "type-validate-functions-input",
                            "aria-label": "type-validate-functions-input",
                        }}
                        fullWidth
                        value={state.validateFunctions.textarea}
                        error={state.validateFunctions.hasErrors}
                        helperText={state.validateFunctions.hasErrors ? "Invalid JSON" : ""}
                        name={"type-validate-functions-textfield"}
                        label={"Validate Functions"}
                        multiline
                        rows={5}
                        variant="outlined"
                        onChange={(e) => {
                            dispatch({ type: "handleUpdateValidateFunctionsTextarea", value: e.target.value });
                            dispatch({ type: "handleUpdateValidateFunctions", value: JSON.parse(e.target.value) });
                        }}
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
