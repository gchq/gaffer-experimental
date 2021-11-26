import { Box, Button, Grid, TextField } from "@material-ui/core";
import React, { ReactElement } from "react";
import ReactJson from "react-json-view";
import { useImmerReducer } from "use-immer";

interface IProps {
    onAddValidateFunctions(validateFunctions: object): void;
}

interface IState {
    validateFunctionObject: {
        class: string;
    };
    nestedObject: {};
    classValue: string;
    additionalKey: string;
    additionalValue: string;
}

export default function AddValidateFunctions(props: IProps): ReactElement {
    const { onAddValidateFunctions } = props;

    const initialState: IState = {
        validateFunctionObject: {
            class: "",
        },
        nestedObject: {},
        classValue: "",
        additionalKey: "",
        additionalValue: "",
    };

    function onAddValidateFunctionsSubmit() {
        onAddValidateFunctions(state.validateFunctionObject);
        dispatch({ type: "reset" });
    }
    function additionalKVSubmit() {
        dispatch({ type: "submitKVPair" });
    }

    function disableAddValidateFunctionsButton(): boolean {
        return state.validateFunctionObject.class.length === 0;
    }
    function disableKVButton(): boolean {
        return state.additionalKey.length === 0 || state.additionalValue.length === 0;
    }

    function addEdgeReducer(draft: any, action: any) {
        switch (action.type) {
            case "reset":
                return initialState;
            case "validateClass":
                draft.classValue = action.value;
                draft.validateFunctionObject.class = draft.classValue;
                return;
            case "handleUpdateNestedObject":
                draft.nestedObject = Object.assign(draft.nestedObject, action.value);
                draft.validateFunctionObject["value"] = draft.nestedObject;
                return;
            case "validateAdditionalKey":
                draft.additionalKey = action.value;
                return;
            case "validateAdditionalValue":
                draft.additionalValue = action.value;
                return;
            case "submitKVPair":
                draft.validateFunctionObject[draft.additionalKey] = draft.additionalValue;
                draft.additionalValue = "";
                draft.additionalKey = "";
                return;
        }
    }
    const [state, dispatch] = useImmerReducer(addEdgeReducer, initialState);

    return (
        <Grid container spacing={2} direction="column" id={"add-validate-functions-inputs"}>
            <Grid item>
                <TextField
                    id={"validate-functions-class-input"}
                    label={"Validate Functions Class"}
                    aria-label="validate-functions-class-input"
                    inputProps={{
                        name: "Validate Functions Class",
                        id: "validate-functions-class-input",
                        "aria-label": "validate-functions-class-input",
                    }}
                    name={"validate-functions-class"}
                    value={state.classValue}
                    variant="outlined"
                    fullWidth
                    required
                    onChange={(e) => dispatch({ type: "validateClass", value: e.target.value })}
                />
            </Grid>
            <Grid item>
                <TextField
                    id={"validate-functions-additional-key-input"}
                    label={"Validate Functions Key"}
                    aria-label="validate-functions-additional-key-input"
                    inputProps={{
                        name: "Validate Functions Key",
                        id: "validate-functions-additional-key-input",
                        "aria-label": "validate-functions-additional-key-input",
                    }}
                    name={"validate-functions-additional-key"}
                    value={state.additionalKey}
                    variant="outlined"
                    fullWidth
                    required
                    onChange={(e) => dispatch({ type: "validateAdditionalKey", value: e.target.value })}
                />
            </Grid>
            <Grid item>
                <TextField
                    id={"validate-functions-additional-value-input"}
                    label={"Validate Functions Value"}
                    aria-label="validate-functions-additional-value-input"
                    inputProps={{
                        name: "Validate Functions Value",
                        id: "validate-functions-additional-value-input",
                        "aria-label": "validate-functions-additional-value-input",
                    }}
                    name={"validate-functions-additional-value"}
                    value={state.additionalValue}
                    variant="outlined"
                    fullWidth
                    required
                    onChange={(e) => dispatch({ type: "validateAdditionalValue", value: e.target.value })}
                />
            </Grid>
            <Box display="flex" alignItems="center" justifyContent="center">
                <Button
                    id={"add-additional-kv-button"}
                    name={"Add Key Value Pair"}
                    variant="outlined"
                    onClick={additionalKVSubmit}
                    disabled={disableKVButton()}
                >
                    Add Key Value Pair
                </Button>
            </Box>
            <Grid item>
                <Grid id={"json-validate-functions-schema-viewer"}>
                    <ReactJson
                        src={state.nestedObject}
                        name={"value"}
                        theme="bright"
                        onAdd={(e) => {
                            dispatch({ type: "handleUpdateNestedObject", value: e.updated_src });
                        }}
                        onEdit={(e) => {
                            dispatch({ type: "handleUpdateNestedObject", value: e.updated_src });
                        }}
                        onDelete={(e) => {
                            dispatch({ type: "handleUpdateNestedObject", value: e.updated_src });
                        }}
                        displayDataTypes={false}
                        displayObjectSize={false}
                        collapsed={false}
                    />
                </Grid>
            </Grid>
            <Box display="flex" alignItems="center" justifyContent="center">
                <Button
                    id={"add-validate-functions-button"}
                    name={"Add Validate Functions"}
                    variant="outlined"
                    onClick={onAddValidateFunctionsSubmit}
                    disabled={disableAddValidateFunctionsButton()}
                >
                    Add Validate Functions
                </Button>
            </Box>
        </Grid>
    );
}
