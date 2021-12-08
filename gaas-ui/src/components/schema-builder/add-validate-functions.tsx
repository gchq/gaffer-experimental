import {
    Box,
    Button,
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from "@material-ui/core";
import React, { ReactElement } from "react";
import ReactJson from "react-json-view";
import { useImmerReducer } from "use-immer";
import DeleteOutlineOutlinedIcon from "@material-ui/icons/DeleteOutlineOutlined";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";

interface IProps {
    onAddValidateFunctions(validateFunctions: object): void;
}

interface IState {
    valueObject: {};
    classValue: string;
    additionalKey: string;
    additionalValue: string;
    keyValueArray: Array<[string, string]>;
}

export default function AddValidateFunctions(props: IProps): ReactElement {
    const { onAddValidateFunctions } = props;

    const initialState: IState = {
        keyValueArray: [],
        valueObject: {},
        classValue: "",
        additionalKey: "",
        additionalValue: "",
    };

    function onAddValidateFunctionsSubmit() {
        const validateFunctionObject = {
            class: state.classValue,
        };
        state.keyValueArray.forEach(([first, second]: [string, string]) => {
            // @ts-ignore
            validateFunctionObject[first] = second;
        });
        if (Object.keys(state.valueObject).length !== 0) {
            // @ts-ignore
            validateFunctionObject["value"] = state.valueObject;
        }
        onAddValidateFunctions(validateFunctionObject);
        dispatch({ type: "reset" });
    }

    function additionalKVSubmit() {
        dispatch({ type: "submitKVPair" });
    }

    function disableAddValidateFunctionsButton(): boolean {
        return state.classValue.length === 0;
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
                return;
            case "handleUpdateValueObject":
                draft.nestedObject = Object.assign(draft.nestedObject, action.value);
                return;
            case "validateAdditionalKey":
                draft.additionalKey = action.value;
                return;
            case "validateAdditionalValue":
                draft.additionalValue = action.value;
                return;
            case "submitKVPair":
                draft.keyValueArray[draft.keyValueArray.length] = [draft.additionalKey, draft.additionalValue];
                draft.additionalValue = "";
                draft.additionalKey = "";
                return;
            case "deleteKVPair":
                draft.keyValueArray = draft.keyValueArray.filter((item: [string, string]) => item[0] !== action.value);
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
                    id={"additional-key-input"}
                    label={"Validate Functions Key"}
                    aria-label="additional-key-input"
                    inputProps={{
                        name: "Validate Functions Key",
                        id: "additional-key-input",
                        "aria-label": "additional-key-input",
                    }}
                    name={"additional-key"}
                    value={state.additionalKey}
                    variant="outlined"
                    fullWidth
                    required
                    onChange={(e) => dispatch({ type: "validateAdditionalKey", value: e.target.value })}
                />
            </Grid>
            <Grid item>
                <TextField
                    id={"additional-value-input"}
                    label={"Validate Functions Value"}
                    aria-label="additional-value-input"
                    inputProps={{
                        name: "Validate Functions Value",
                        id: "additional-value-input",
                        "aria-label": "additional-value-input",
                    }}
                    name={"additional-value"}
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
            <TableContainer component={Paper} style={{ margin: 10 }}>
                <Table>
                    <TableHead>
                        <TableRow style={{ background: "#F4F2F2" }}>
                            <TableCell>Key</TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {state.keyValueArray.map(([key, value]) => (
                            <TableRow>
                                <TableCell>{key}</TableCell>
                                <TableCell>{value}</TableCell>
                                <TableCell>
                                    <IconButton edge="end" aria-label="delete">
                                        <EditOutlinedIcon />
                                    </IconButton>
                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={() => {
                                            dispatch({ type: "deleteKVPair", value: key });
                                        }}
                                    >
                                        <DeleteOutlineOutlinedIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Grid item>
                <Grid id={"json-validate-functions-schema-viewer"}>
                    <ReactJson
                        src={state.valueObject}
                        name={"value"}
                        theme="bright"
                        onAdd={(e) => {
                            dispatch({ type: "handleUpdateValueObject", value: e.updated_src });
                        }}
                        onEdit={(e) => {
                            dispatch({ type: "handleUpdateValueObject", value: e.updated_src });
                        }}
                        onDelete={(e) => {
                            dispatch({ type: "handleUpdateValueObject", value: e.updated_src });
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
