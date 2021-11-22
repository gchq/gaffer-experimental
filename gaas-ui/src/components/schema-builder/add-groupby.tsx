import { Box, Button, Grid, TextField } from "@material-ui/core";
import React, { ReactElement } from "react";
import { useImmerReducer } from "use-immer";

interface IProps {
    onAddGroupby(groupby: string): void;
}

interface IState {
    groupby: string;
}

export default function AddGroupby(props: IProps): ReactElement {
    const { onAddGroupby } = props;

    const initialState: IState = {
        groupby: "",
    };

    function addGroupbySubmit() {
        onAddGroupby(state.groupby);
        dispatch({ type: "reset" });
    }

    function addGroupbyReducer(draft: any, action: any) {
        switch (action.type) {
            case "reset":
                return initialState;
            case "validateGroupbyKey":
                draft.groupby = action.value;
                return;
        }
    }
    const [state, dispatch] = useImmerReducer(addGroupbyReducer, initialState);

    return (
        <Grid container spacing={2} direction="column" id={"add-groupby-inputs"}>
            <Grid item>
                <TextField
                    id={"groupby-key-input"}
                    label={"Groupby Key"}
                    aria-label="groupby-key-input"
                    inputProps={{
                        name: "Groupby Key",
                        id: "groupby-key-input",
                        "aria-label": "groupby-key-input",
                    }}
                    name={"groupby-key"}
                    value={state.groupby}
                    variant="outlined"
                    fullWidth
                    required
                    onChange={(e) => dispatch({ type: "validateGroupbyKey", value: e.target.value })}
                />
            </Grid>
            <Box display="flex" alignItems="center" justifyContent="center">
                <Button id={"add-groupby-button"} name={"Add Groupby"} variant="outlined" onClick={addGroupbySubmit}>
                    Add Groupby
                </Button>
            </Box>
        </Grid>
    );
}
