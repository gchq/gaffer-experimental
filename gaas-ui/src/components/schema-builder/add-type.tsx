import React, {ReactElement} from "react";
import {Button, Grid, TextField} from "@material-ui/core";
import {useImmerReducer} from "use-immer";

interface IProps {
    onAddType(type: object): void;
}
interface IState {
    typeName: {
        value: string;
        hasErrors: boolean;
        message: string;
    },
    typeDescription: {
        value: string;
        hasErrors: boolean;
        message: string;
    },
    typeClass: {
        value: string;
        hasErrors: boolean;
        message: string;
    },

}

export default function AddType(props: IProps): ReactElement {
    const {onAddType} = props;

    const initialState: IState = {
        typeName: {
            value: "",
            hasErrors: false,
            message: ""
        },

        typeDescription: {
            value: "",
            hasErrors: false,
            message: ""
        },

        typeClass: {
            value: "",
            hasErrors: false,
            message: ""
        }
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
                draft.typeDescription.message = "Type description can only contain alpha numeric letters and spaces";
            }
            return;

      case "validateTypeClass":
        draft.typeClass.hasErrors = false
        draft.typeClass.value = action.value
        draft.typeClass.message = ""
        if (draft.typeClass.value && !/^[a-zA-Z\.]*$/.test(draft.typeClass.value)) {
          draft.typeClass.hasErrors = true
          draft.typeClass.message = "Type class can only contain letters and ."
        }
    }

    const [state, dispatch] = useImmerReducer(addTypeReducer, initialState);

    function disableAddTypeButton(): boolean {
        return state.typeName.value.length === 0 || state.typeName.hasErrors || state.typeDescription.value.length === 0 || state.typeDescription.hasErrors || state.typeClass.value.length === 0 || state.typeClass.hasErrors;
    }

    function addTypeSubmit() {
        const typeToAdd: any = {};
        typeToAdd[state.typeName.value] = {
            description: state.typeDescription.value,
            class: state.typeClass.value
        };
        onAddType(typeToAdd);
        dispatch({type: "reset"});
    }

    return (
        <Grid id={"add-type-component"}>
            <Grid container direction="column" justify="center" alignItems="center" id={"add-type-inputs"}>
                <TextField
                    id={"type-name-input"}
                    label={"Type Name"}
                    value={state.typeName.value}
                    aria-label="type-name-input"
                    inputProps={{
                        name: "Type Name",
                        id: "type-name-input",
                        "aria-label": "type-name-input"
                    }}
                    error={state.typeName.hasErrors}
                    onChange={(e) => dispatch({type: "validateTypeName", value: e.target.value})}
                    helperText={state.typeName.message}
                    name={"type-name"}
                    autoComplete="type-name"
                />
                <TextField
                    id={"type-description-input"}
                    label={"Description"}
                    value={state.typeDescription.value}
                    aria-label="type-description-input"
                    inputProps={{
                        name: "Type Description",
                        id: "type-description-input",
                        "aria-label": "type-description-input"
                    }}
                    error={state.typeDescription.hasErrors}
                    onChange={(e) => dispatch({type: "validateTypeDescription", value: e.target.value})}
                    helperText={state.typeDescription.message}
                    name={"type-description"}
                    autoComplete="type-description"
                />
                <TextField
                    id={"type-class-input"}
                    label={"Class"}
                    value={state.typeClass.value}
                    aria-label="type-class-input"
                    inputProps={{
                        name: "Type Class",
                        id: "type-class-input",
                        "aria-label": "type-class-input"
                    }}
                    error={state.typeClass.hasErrors}
                    onChange={(e) => dispatch({type: "validateTypeClass", value: e.target.value})}
                    helperText={state.typeClass.message}
                    name={"type-class"}
                    autoComplete="type-class"
                />
                <Button id={"add-type-button"} name={"Add Type"} disabled={disableAddTypeButton()}
                        onClick={addTypeSubmit}>
                    Add Type
                </Button>
            </Grid>
        </Grid>
    );
}
