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
import AddProperty from "./add-property";
import ClearIcon from "@material-ui/icons/Clear";
import sanitizeInputs, { isJSONString } from "../../util/sanitize-inputs";

interface IProps {
    onAddEntity(entity: object): void;

    types: Array<string>;
}

interface IState {
    entityName: {
        value: string;
        hasErrors: boolean;
        message: string;
    };
    entityDescription: {
        value: string;
        hasErrors: boolean;
        message: string;
    };
    entityVertex: {
        value: string;
    };
    properties: {
        properties: {};
        open: boolean;
        textarea: string;
        hasErrors: boolean;
    };
}

export default function AddEntity(props: IProps): ReactElement {
    const { onAddEntity, types } = props;

    function addEntitySubmit() {
        const entityToAdd: any = {};
        entityToAdd[sanitizeInputs(state.entityName.value)] = {
            description: sanitizeInputs(state.entityDescription.value),
            vertex: sanitizeInputs(state.entityVertex.value),
            properties: state.properties.properties,
        };
        onAddEntity(entityToAdd);
        dispatch({ type: "reset" });
    }

    const initialState: IState = {
        entityName: {
            value: "",
            hasErrors: false,
            message: "",
        },

        entityDescription: {
            value: "",
            hasErrors: false,
            message: "",
        },

        entityVertex: {
            value: "",
        },

        properties: {
            properties: {},
            open: false,
            textarea: "",
            hasErrors: false,
        },
    };

    function addEntityReducer(draft: any, action: any) {
        switch (action.type) {
            case "reset":
                return initialState;

            case "validateEntityName":
                draft.entityName.hasErrors = false;
                draft.entityName.value = action.value;
                draft.entityName.message = "";
                if (draft.entityName.value && !/^[a-zA-Z]+$/.test(draft.entityName.value)) {
                    draft.entityName.hasErrors = true;
                    draft.entityName.message = "Entity name can only contain letters";
                }
                return;

            case "validateEntityDescription":
                draft.entityDescription.hasErrors = false;
                draft.entityDescription.value = action.value;
                draft.entityDescription.message = "";
                if (draft.entityDescription.value && !/^[a-zA-Z0-9\s]+$/.test(draft.entityDescription.value)) {
                    draft.entityDescription.hasErrors = true;
                    draft.entityDescription.message =
                        "Entity description can only contain alpha numeric letters and spaces";
                }
                return;

            case "validateEntityVertex":
                draft.entityVertex.value = action.value;
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
        }
    }

    const [state, dispatch] = useImmerReducer(addEntityReducer, initialState);

    function disableAddEntityButton(): boolean {
        return (
            state.entityName.value.length === 0 ||
            state.entityName.hasErrors ||
            state.entityDescription.value.length === 0 ||
            state.entityDescription.hasErrors ||
            state.entityVertex.value.length === 0
        );
    }

    function closeProperty() {
        dispatch({ type: "handleClickCloseProperties", value: false });
    }

    return (
        <Grid container spacing={2} direction="column" id={"add-entity-inputs"}>
            <Grid item>
                <TextField
                    value={state.entityName.value}
                    id={"entity-name-input"}
                    label={"Entity Name"}
                    aria-label="entity-name-input"
                    inputProps={{
                        name: "Entity Name",
                        id: "entity-name-input",
                        "aria-label": "entity-name-input",
                        maxLength: 20,
                    }}
                    variant="outlined"
                    fullWidth
                    name={"entity-name"}
                    error={state.entityName.hasErrors}
                    required
                    autoFocus
                    onChange={(e) => dispatch({ type: "validateEntityName", value: e.target.value })}
                    helperText={state.entityName.message}
                />
            </Grid>
            <Grid item>
                <TextField
                    id={"entity-description-input"}
                    value={state.entityDescription.value}
                    label={"Description"}
                    aria-label="entity-description-input"
                    inputProps={{
                        name: "Entity Description",
                        id: "entity-description-input",
                        "aria-label": "entity-description-input",
                        maxLength: 120,
                    }}
                    variant="outlined"
                    fullWidth
                    name={"entity-description"}
                    error={state.entityDescription.hasErrors}
                    required
                    autoFocus
                    onChange={(e) => dispatch({ type: "validateEntityDescription", value: e.target.value })}
                    helperText={state.entityDescription.message}
                />
            </Grid>
            <Grid item>
                <FormControl variant="outlined" fullWidth id={"entity-vertex-formcontrol"} required>
                    <InputLabel id="entity-vertex-select-label">Vertex</InputLabel>
                    <Select
                        labelId="entity-vertex-select-label"
                        id="entity-vertex-select"
                        label="Vertex"
                        value={state.entityVertex.value}
                        inputProps={{
                            name: "Vertex",
                            id: "entity-vertex-input",
                            "aria-label": "entity-vertex-input",
                        }}
                        onChange={(e) => dispatch({ type: "validateEntityVertex", value: e.target.value })}
                    >
                        {types.map((type: string) => (
                            <MenuItem
                                key={type + "-item"}
                                value={type}
                                aria-label={type + "-menu-item"}
                                id={type + "-menu-item"}
                                aria-labelledby={"vertex-select-label"}
                            >
                                {type}
                            </MenuItem>
                        ))}
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
                    onClose={closeProperty}
                    id={"add-properties-dialog"}
                    aria-labelledby="add-properties-dialog"
                >
                    <Box display="flex" alignItems="right" justifyContent="right">
                        <IconButton id="close-add-properties-button" onClick={closeProperty}>
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
                    id="entity-properties-input"
                    inputProps={{
                        name: "Entity Properties",
                        id: "entity-properties-input",
                        "aria-label": "entity-properties-input",
                    }}
                    fullWidth
                    value={state.properties.textarea}
                    name="entity-properties"
                    error={state.properties.hasErrors}
                    helperText={state.properties.hasErrors ? "Invalid JSON" : ""}
                    label={"Properties"}
                    multiline
                    rows={5}
                    variant="outlined"
                    onChange={(e) => {
                        dispatch({ type: "handleUpdatePropertiesTextarea", value: e.target.value });
                        dispatch({ type: "handleUpdateProperties", value: JSON.parse(e.target.value) });
                    }}
                />
            </Grid>
            <Box display="flex" alignItems="center" justifyContent="center">
                <Button
                    variant="outlined"
                    id={"add-entity-button"}
                    name={"Add Entity"}
                    disabled={disableAddEntityButton()}
                    onClick={addEntitySubmit}
                >
                    Add Entity
                </Button>
            </Box>
        </Grid>
    );
}
