import React, { ReactElement } from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, TextField } from "@material-ui/core";
import { useImmerReducer } from "use-immer";
import AddAggregateFunction from "./add-aggregate-function";
import ClearIcon from "@material-ui/icons/Clear";
import AddSerialiser from "./add-serialiser";
import AddValidateFunctions from "./add-validate-functions";

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
    validateFunctions: [];
    openValidateFunctions: boolean;
    serialiserTextarea: string;
    aggregateFunctionTextarea: string;
    validateFunctionsTextarea: string;
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
        validateFunctions: [],
        openValidateFunctions: false,
        serialiserTextarea: "",
        aggregateFunctionTextarea: "",
        validateFunctionsTextarea: "",
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
                draft.serialiserTextarea = action.value;
                return;
            case "handleUpdateAggregateFunctionTextarea":
                draft.aggregateFunctionTextarea = action.value;
                return;
            case "handleUpdateValidateFunctionsTextarea":
                draft.validateFunctionsTextarea = action.value;
                return;
            case "handleClickCloseAggregateFunction":
                draft.openAggregateFunction = action.value;
                return;
            case "handleUpdateAggregateFunction":
                draft.aggregateFunction = action.value;
                return;
            case "handleClickCloseSerialiser":
                draft.openSerialiser = action.value;
                return;
            case "handleUpdateSerialiser":
                draft.serialiser = action.value;
                return;
            case "handleClickCloseValidateFunctions":
                draft.openValidateFunctions = action.value;
                return;
            case "handleUpdateValidateFunctions":
                draft.validateFunctions[draft.validateFunctions.length] = action.value;
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
        };
        if (Object.keys(state.aggregateFunction).length !== 0) {
            typeToAdd[state.typeName.value].aggregateFunction = state.aggregateFunction;
        }
        if (Object.keys(state.serialiser).length !== 0) {
            typeToAdd[state.typeName.value].serialiser = state.serialiser;
        }
        if (state.validateFunctions.length !== 0) {
            typeToAdd[state.typeName.value].validateFunctions = state.validateFunctions;
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
                        open={state.openAggregateFunction}
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
                        value={state.aggregateFunctionTextarea}
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
                        open={state.openSerialiser}
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
                        value={state.serialiserTextarea}
                        name={"type-serialiser-textfield"}
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
                        open={state.openValidateFunctions}
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
                                        value: state.validateFunctionsTextarea + JSON.stringify(validateFunctions),
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
                        value={state.validateFunctionsTextarea}
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
